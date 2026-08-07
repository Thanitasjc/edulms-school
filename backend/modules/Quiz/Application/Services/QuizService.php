<?php

namespace Modules\Quiz\Application\Services;

use App\Core\Support\QueryFilter;
use App\Core\Support\TenantContext;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use Modules\Course\Domain\Models\Course;
use Modules\Enrollment\Domain\Models\Enrollment;
use Modules\Quiz\Domain\Models\Quiz;
use Modules\Quiz\Domain\Models\QuizAttempt;
use Modules\Quiz\Domain\Models\QuizQuestion;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Throwable;

class QuizService
{
    public function listAdmin(QueryFilter $queryFilter): LengthAwarePaginator
    {
        $query = Quiz::query()->with('questions');

        $queryFilter->apply(
            $query,
            searchable: ['title'],
            filterable: ['status', 'course_id', 'lesson_key'],
            sortable: ['id', 'title', 'created_at', 'updated_at']
        );

        return $query->paginate($queryFilter->perPage());
    }

    public function findAdmin(int $id): Quiz
    {
        /** @var Quiz $quiz */
        $quiz = Quiz::query()->with('questions')->findOrFail($id);

        return $quiz;
    }

    /**
     * @throws Throwable
     */
    public function create(array $data): Quiz
    {
        return DB::transaction(function () use ($data): Quiz {
            $questions = $data['questions'] ?? [];
            unset($data['questions']);

            if (empty($data['company_id'])) {
                $data['company_id'] = TenantContext::id();
            }

            /** @var Quiz $quiz */
            $quiz = Quiz::query()->create($data);
            $this->syncQuestions($quiz, $questions);

            return $quiz->load('questions');
        });
    }

    /**
     * @throws Throwable
     */
    public function update(int $id, array $data): Quiz
    {
        return DB::transaction(function () use ($id, $data): Quiz {
            $quiz = $this->findAdmin($id);
            $questions = $data['questions'] ?? null;
            unset($data['questions']);

            $quiz->update($data);

            if (is_array($questions)) {
                $this->syncQuestions($quiz, $questions);
            }

            return $quiz->refresh()->load('questions');
        });
    }

    /**
     * @throws Throwable
     */
    public function delete(int $id): bool
    {
        return DB::transaction(function () use ($id): bool {
            return (bool) $this->findAdmin($id)->delete();
        });
    }

    public function listPublicByCourseSlug(string $slug): Collection
    {
        $course = $this->findPublishedCourse($slug);

        return Quiz::query()
            ->withoutGlobalScope('company')
            ->published()
            ->where('course_id', $course->id)
            ->with(['questions' => fn ($query) => $query->orderBy('sort_order')])
            ->orderByRaw('lesson_key IS NULL DESC')
            ->orderBy('id')
            ->get();
    }

    public function getPublicQuiz(int $id): Quiz
    {
        /** @var Quiz|null $quiz */
        $quiz = Quiz::query()
            ->withoutGlobalScope('company')
            ->published()
            ->with([
                'questions' => fn ($query) => $query->orderBy('sort_order'),
                'course',
            ])
            ->find($id);

        if ($quiz === null) {
            throw new NotFoundHttpException(__('api.quiz.not_found'));
        }

        return $quiz;
    }

    /**
     * @param  array<int|string, string>  $answers
     * @return array{score: float, passed: bool, attempt: QuizAttempt}
     *
     * @throws Throwable
     */
    public function submitAttempt(User $user, int $quizId, array $answers): array
    {
        $quiz = $this->getPublicQuiz($quizId);
        $course = $quiz->course ?? Course::query()
            ->withoutGlobalScope('company')
            ->findOrFail($quiz->course_id);

        $enrollment = Enrollment::query()
            ->withoutGlobalScope('company')
            ->where('user_id', $user->id)
            ->where('course_id', $course->id)
            ->where('status', 'active')
            ->first();

        if ($enrollment === null && ((bool) $course->is_free || (float) $course->price <= 0)) {
            try {
                $enrollment = app(\Modules\Enrollment\Application\Services\EnrollmentService::class)
                    ->purchase($user, (int) $course->id);
            } catch (Throwable) {
                $enrollment = Enrollment::query()
                    ->withoutGlobalScope('company')
                    ->where('user_id', $user->id)
                    ->where('course_id', $course->id)
                    ->where('status', 'active')
                    ->first();
            }
        }

        if ($enrollment === null) {
            throw new AccessDeniedHttpException(__('api.quiz.not_enrolled'));
        }

        return DB::transaction(function () use ($user, $quiz, $course, $enrollment, $answers): array {
            $questions = $quiz->questions;
            $total = $questions->count();
            $correct = 0;
            $normalizedAnswers = [];

            foreach ($questions as $question) {
                $questionId = (string) $question->id;
                $selected = $answers[$question->id] ?? $answers[$questionId] ?? null;
                $normalizedAnswers[$questionId] = $selected;

                if ($selected !== null && (string) $selected === (string) $question->correct_option) {
                    $correct++;
                }
            }

            $score = $total > 0 ? round(($correct / $total) * 100, 2) : 0.0;
            $passed = $score >= (int) $quiz->pass_percentage;

            /** @var QuizAttempt $attempt */
            $attempt = QuizAttempt::query()->create([
                'company_id' => $course->company_id,
                'quiz_id' => $quiz->id,
                'course_id' => $course->id,
                'user_id' => $user->id,
                'enrollment_id' => $enrollment->id,
                'score' => $score,
                'passed' => $passed,
                'answers' => $normalizedAnswers,
                'completed_at' => now(),
            ]);

            if ($passed && $quiz->isFinalQuiz()) {
                $this->tryIssueCertificate($user, $course, $attempt);
            }

            return [
                'score' => $score,
                'passed' => $passed,
                'attempt' => $attempt,
            ];
        });
    }

    private function findPublishedCourse(string $slug): Course
    {
        /** @var Course|null $course */
        $course = Course::query()
            ->withoutGlobalScope('company')
            ->published()
            ->where('slug', $slug)
            ->first();

        if ($course === null) {
            throw new NotFoundHttpException(__('api.enrollment.course_not_found'));
        }

        return $course;
    }

    /**
     * @param  list<array{question: string, options: list<array{key: string, text: string}>, correct_option: string, sort_order?: int}>  $questions
     */
    private function syncQuestions(Quiz $quiz, array $questions): void
    {
        $quiz->questions()->delete();

        foreach (array_values($questions) as $index => $questionData) {
            QuizQuestion::query()->create([
                'quiz_id' => $quiz->id,
                'question' => $questionData['question'],
                'options' => $questionData['options'],
                'correct_option' => $questionData['correct_option'],
                'sort_order' => $questionData['sort_order'] ?? $index,
            ]);
        }
    }

    private function tryIssueCertificate(User $user, Course $course, QuizAttempt $attempt): void
    {
        if (! class_exists(\Modules\Certificate\Application\Services\CertificateService::class)) {
            return;
        }

        app(\Modules\Certificate\Application\Services\CertificateService::class)
            ->issueIfEligible($user, $course, $attempt);
    }
}
