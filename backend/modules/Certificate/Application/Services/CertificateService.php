<?php

namespace Modules\Certificate\Application\Services;

use App\Core\Support\QueryFilter;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Modules\Certificate\Domain\Models\Certificate;
use Modules\Course\Domain\Models\Course;
use Modules\Enrollment\Domain\Models\Enrollment;
use Modules\Quiz\Domain\Models\Quiz;
use Modules\Quiz\Domain\Models\QuizAttempt;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Throwable;

class CertificateService
{
    public function listMine(User $user): Collection
    {
        return Certificate::query()
            ->withoutGlobalScope('company')
            ->where('user_id', $user->id)
            ->with(['course'])
            ->orderByDesc('issued_at')
            ->get();
    }

    public function listAdmin(QueryFilter $queryFilter): LengthAwarePaginator
    {
        $query = Certificate::query()->with(['course', 'user']);

        $queryFilter->apply(
            $query,
            searchable: ['code', 'learner_name', 'course_title'],
            filterable: ['course_id', 'user_id'],
            sortable: ['id', 'issued_at', 'created_at']
        );

        return $query->paginate($queryFilter->perPage());
    }

    public function findAdmin(int $id): Certificate
    {
        /** @var Certificate $certificate */
        $certificate = Certificate::query()
            ->with(['course', 'user', 'quizAttempt'])
            ->findOrFail($id);

        return $certificate;
    }

    public function findByCode(string $code): Certificate
    {
        /** @var Certificate|null $certificate */
        $certificate = Certificate::query()
            ->withoutGlobalScope('company')
            ->with(['course', 'user'])
            ->where('code', $code)
            ->first();

        if ($certificate === null) {
            throw new NotFoundHttpException(__('api.certificate.not_found'));
        }

        return $certificate;
    }

    /**
     * @throws Throwable
     */
    public function issueIfEligible(User $user, Course $course, ?QuizAttempt $quizAttempt = null): ?Certificate
    {
        $existing = Certificate::query()
            ->withoutGlobalScope('company')
            ->where('user_id', $user->id)
            ->where('course_id', $course->id)
            ->first();

        if ($existing !== null) {
            return $existing;
        }

        $enrollment = Enrollment::query()
            ->withoutGlobalScope('company')
            ->where('user_id', $user->id)
            ->where('course_id', $course->id)
            ->where('status', 'active')
            ->first();

        if ($enrollment === null) {
            return null;
        }

        if (! $this->hasCompletedProgress($enrollment, $course)) {
            return null;
        }

        if (! $this->hasPassedFinalQuizIfRequired($user, $course, $quizAttempt)) {
            return null;
        }

        return DB::transaction(function () use ($user, $course, $enrollment, $quizAttempt): Certificate {
            $duplicate = Certificate::query()
                ->withoutGlobalScope('company')
                ->where('user_id', $user->id)
                ->where('course_id', $course->id)
                ->lockForUpdate()
                ->first();

            if ($duplicate !== null) {
                return $duplicate;
            }

            /** @var Certificate $certificate */
            $certificate = Certificate::query()->create([
                'company_id' => $course->company_id,
                'course_id' => $course->id,
                'user_id' => $user->id,
                'enrollment_id' => $enrollment->id,
                'code' => $this->generateUniqueCode(),
                'learner_name' => $user->name,
                'course_title' => $course->title,
                'issued_at' => now(),
                'quiz_attempt_id' => $quizAttempt?->id,
            ]);

            return $certificate;
        });
    }

    private function hasCompletedProgress(Enrollment $enrollment, Course $course): bool
    {
        if ((int) $enrollment->progress_percent >= 100) {
            return true;
        }

        $totalLessons = (int) $enrollment->total_lessons;
        $completedLessons = (int) $enrollment->completed_lessons;

        if ($totalLessons > 0) {
            return $completedLessons >= $totalLessons;
        }

        $curriculumTotal = $this->countCurriculumLessons($course);

        return $curriculumTotal > 0 && $completedLessons >= $curriculumTotal;
    }

    private function hasPassedFinalQuizIfRequired(User $user, Course $course, ?QuizAttempt $quizAttempt): bool
    {
        $finalQuiz = Quiz::query()
            ->withoutGlobalScope('company')
            ->published()
            ->where('course_id', $course->id)
            ->whereNull('lesson_key')
            ->first();

        if ($finalQuiz === null) {
            return true;
        }

        if ($quizAttempt !== null
            && (int) $quizAttempt->quiz_id === (int) $finalQuiz->id
            && $quizAttempt->passed) {
            return true;
        }

        return QuizAttempt::query()
            ->withoutGlobalScope('company')
            ->where('user_id', $user->id)
            ->where('quiz_id', $finalQuiz->id)
            ->where('passed', true)
            ->exists();
    }

    private function countCurriculumLessons(Course $course): int
    {
        $count = 0;
        $curriculum = is_array($course->curriculum) ? $course->curriculum : [];

        foreach ($curriculum['sections'] ?? [] as $section) {
            $count += count($section['lessons'] ?? []);
        }

        return $count;
    }

    private function generateUniqueCode(): string
    {
        do {
            $code = 'CERT-'.strtoupper(Str::random(10));
        } while (
            Certificate::withTrashed()
                ->withoutGlobalScope('company')
                ->where('code', $code)
                ->exists()
        );

        return $code;
    }
}
