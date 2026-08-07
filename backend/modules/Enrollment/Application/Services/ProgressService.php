<?php

namespace Modules\Enrollment\Application\Services;

use App\Models\User;
use Illuminate\Support\Facades\DB;
use Modules\Course\Domain\Models\Course;
use Modules\Enrollment\Domain\Models\Enrollment;
use Modules\Enrollment\Domain\Models\LessonProgress;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Throwable;

class ProgressService
{
    public function __construct(
        private readonly EnrollmentService $enrollmentService
    ) {}

    /**
     * @return array{
     *   enrollment_id: ?int,
     *   progress_percent: int,
     *   completed_lessons: int,
     *   total_lessons: int,
     *   completed_keys: list<string>,
     *   last_lesson_key: ?string,
     *   last_section_index: ?int,
     *   last_lesson_index: ?int,
     *   can_track: bool
     * }
     */
    public function summaryForCourse(User $user, string $slug): array
    {
        $course = $this->findPublishedCourse($slug);
        $enrollment = $this->findActiveEnrollment($user, (int) $course->id);

        if ($enrollment === null) {
            $total = $this->countCurriculumLessons($course);

            return [
                'enrollment_id' => null,
                'progress_percent' => 0,
                'completed_lessons' => 0,
                'total_lessons' => $total,
                'completed_keys' => [],
                'last_lesson_key' => null,
                'last_section_index' => null,
                'last_lesson_index' => null,
                'can_track' => $this->canStartTracking($course),
            ];
        }

        $this->recalculateEnrollmentProgress($enrollment, $course);

        $completedKeys = LessonProgress::query()
            ->withoutGlobalScope('company')
            ->where('enrollment_id', $enrollment->id)
            ->where('status', 'completed')
            ->pluck('lesson_key')
            ->values()
            ->all();

        return [
            'enrollment_id' => $enrollment->id,
            'progress_percent' => (int) $enrollment->progress_percent,
            'completed_lessons' => (int) $enrollment->completed_lessons,
            'total_lessons' => (int) $enrollment->total_lessons,
            'completed_keys' => $completedKeys,
            'last_lesson_key' => $enrollment->last_lesson_key,
            'last_section_index' => $enrollment->last_section_index !== null ? (int) $enrollment->last_section_index : null,
            'last_lesson_index' => $enrollment->last_lesson_index !== null ? (int) $enrollment->last_lesson_index : null,
            'can_track' => true,
        ];
    }

    /**
     * @throws Throwable
     */
    public function trackLesson(
        User $user,
        string $slug,
        int $sectionIndex,
        int $lessonIndex,
        string $status = 'in_progress',
        ?string $lessonTitle = null
    ): array {
        $course = $this->findPublishedCourse($slug);
        $enrollment = $this->resolveEnrollmentForTracking($user, $course);

        $lessonKey = self::lessonKey($sectionIndex, $lessonIndex);
        $status = $status === 'completed' ? 'completed' : 'in_progress';

        return DB::transaction(function () use (
            $user,
            $course,
            $enrollment,
            $sectionIndex,
            $lessonIndex,
            $lessonKey,
            $status,
            $lessonTitle
        ): array {
            /** @var LessonProgress $progress */
            $progress = LessonProgress::withTrashed()
                ->withoutGlobalScope('company')
                ->firstOrNew([
                    'user_id' => $user->id,
                    'course_id' => $course->id,
                    'lesson_key' => $lessonKey,
                ]);

            if ($progress->trashed()) {
                $progress->restore();
            }

            $wasCompleted = $progress->exists && $progress->status === 'completed';

            $progress->fill([
                'company_id' => $course->company_id,
                'enrollment_id' => $enrollment->id,
                'section_index' => $sectionIndex,
                'lesson_index' => $lessonIndex,
                'lesson_title' => $lessonTitle,
                'last_viewed_at' => now(),
            ]);

            if ($status === 'completed' || $wasCompleted) {
                $progress->status = 'completed';
                $progress->completed_at = $progress->completed_at ?? now();
            } else {
                $progress->status = 'in_progress';
            }

            $progress->save();

            $enrollment->last_lesson_key = $lessonKey;
            $enrollment->last_section_index = $sectionIndex;
            $enrollment->last_lesson_index = $lessonIndex;
            $enrollment->progress_updated_at = now();
            $enrollment->save();

            $this->recalculateEnrollmentProgress($enrollment->fresh(), $course);

            return $this->summaryForCourse($user, $course->slug);
        });
    }

    public function attachProgressToEnrollment(Enrollment $enrollment): Enrollment
    {
        if ($enrollment->relationLoaded('course') && $enrollment->course) {
            $this->recalculateEnrollmentProgress($enrollment, $enrollment->course);
        }

        return $enrollment->refresh();
    }

    private function resolveEnrollmentForTracking(User $user, Course $course): Enrollment
    {
        $enrollment = $this->findActiveEnrollment($user, (int) $course->id);
        if ($enrollment) {
            return $enrollment;
        }

        if ($this->canStartTracking($course)) {
            return $this->enrollmentService->purchase($user, (int) $course->id);
        }

        throw new AccessDeniedHttpException(__('api.progress.not_enrolled'));
    }

    private function canStartTracking(Course $course): bool
    {
        return (bool) $course->is_free || (float) $course->price <= 0;
    }

    private function findActiveEnrollment(User $user, int $courseId): ?Enrollment
    {
        return Enrollment::query()
            ->withoutGlobalScope('company')
            ->where('user_id', $user->id)
            ->where('course_id', $courseId)
            ->where('status', 'active')
            ->first();
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

    private function recalculateEnrollmentProgress(Enrollment $enrollment, Course $course): void
    {
        $total = $this->countCurriculumLessons($course);
        $completed = LessonProgress::query()
            ->withoutGlobalScope('company')
            ->where('enrollment_id', $enrollment->id)
            ->where('status', 'completed')
            ->count();

        $percent = $total > 0 ? (int) round(($completed / $total) * 100) : 0;
        $previousPercent = (int) $enrollment->progress_percent;

        $enrollment->forceFill([
            'total_lessons' => $total,
            'completed_lessons' => $completed,
            'progress_percent' => min(100, max(0, $percent)),
            'progress_updated_at' => now(),
        ])->save();

        if ((int) $enrollment->progress_percent >= 100 && $previousPercent < 100) {
            $user = User::query()->find($enrollment->user_id);
            if ($user !== null) {
                $this->tryIssueCertificate($user, $course);
            }
        }
    }

    private function tryIssueCertificate(User $user, Course $course): void
    {
        if (! class_exists(\Modules\Certificate\Application\Services\CertificateService::class)) {
            return;
        }

        app(\Modules\Certificate\Application\Services\CertificateService::class)
            ->issueIfEligible($user, $course);
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

    public static function lessonKey(int $sectionIndex, int $lessonIndex): string
    {
        return 's'.$sectionIndex.'-l'.$lessonIndex;
    }
}
