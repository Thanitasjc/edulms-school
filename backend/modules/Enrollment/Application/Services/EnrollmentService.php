<?php

namespace Modules\Enrollment\Application\Services;

use App\Core\Support\QueryFilter;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Modules\Course\Domain\Models\Course;
use Modules\Enrollment\Domain\Models\Enrollment;
use Symfony\Component\HttpKernel\Exception\ConflictHttpException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Throwable;

class EnrollmentService
{
    public function listAdmin(QueryFilter $queryFilter): LengthAwarePaginator
    {
        $query = Enrollment::query()->with(['course', 'user']);

        $queryFilter->apply(
            $query,
            searchable: [],
            filterable: ['status', 'course_id', 'user_id'],
            sortable: ['id', 'enrolled_at', 'amount_paid', 'created_at']
        );

        return $query->paginate($queryFilter->perPage());
    }

    public function listMine(User $user, QueryFilter $queryFilter): LengthAwarePaginator
    {
        $query = Enrollment::query()
            ->with(['course'])
            ->where('user_id', $user->id)
            ->where('status', 'active');

        $queryFilter->apply(
            $query,
            searchable: [],
            filterable: ['course_id'],
            sortable: ['id', 'enrolled_at', 'progress_percent', 'progress_updated_at', 'created_at']
        );

        $paginator = $query->paginate($queryFilter->perPage());

        $progressService = app(ProgressService::class);
        $paginator->getCollection()->transform(function (Enrollment $enrollment) use ($progressService) {
            return $progressService->attachProgressToEnrollment($enrollment);
        });

        return $paginator;
    }

    public function findAdmin(int $id): Enrollment
    {
        /** @var Enrollment $enrollment */
        $enrollment = Enrollment::query()->with(['course', 'user'])->findOrFail($id);

        return $enrollment;
    }

    public function isUserEnrolled(?User $user, int $courseId): bool
    {
        if ($user === null) {
            return false;
        }

        return Enrollment::query()
            ->withoutGlobalScope('company')
            ->where('user_id', $user->id)
            ->where('course_id', $courseId)
            ->where('status', 'active')
            ->exists();
    }

    /**
     * Grant enrollment access (called for free courses or after successful payment).
     *
     * @throws Throwable
     */
    public function purchase(User $user, int $courseId): Enrollment
    {
        return DB::transaction(function () use ($user, $courseId): Enrollment {
            /** @var Course|null $course */
            $course = Course::query()
                ->withoutGlobalScope('company')
                ->published()
                ->find($courseId);

            if ($course === null) {
                throw new NotFoundHttpException(__('api.enrollment.course_not_found'));
            }

            $amount = $this->resolvePrice($course);
            $source = $course->is_free || (float) $course->price <= 0 ? 'free' : 'purchase';

            /** @var Enrollment|null $existing */
            $existing = Enrollment::withTrashed()
                ->withoutGlobalScope('company')
                ->where('user_id', $user->id)
                ->where('course_id', $course->id)
                ->first();

            if ($existing !== null) {
                if ($existing->trashed()) {
                    $existing->restore();
                }

                if ($existing->status === 'active') {
                    throw new ConflictHttpException(__('api.enrollment.already_enrolled'));
                }

                $existing->update([
                    'status' => 'active',
                    'amount_paid' => $amount,
                    'currency' => 'THB',
                    'source' => $source,
                    'enrolled_at' => now(),
                ]);

                $this->bumpStudentsCount($course);

                return $existing->refresh()->load(['course']);
            }

            /** @var Enrollment $enrollment */
            $enrollment = Enrollment::query()->create([
                'company_id' => $course->company_id,
                'course_id' => $course->id,
                'user_id' => $user->id,
                'status' => 'active',
                'amount_paid' => $amount,
                'currency' => 'THB',
                'source' => $source,
                'enrolled_at' => now(),
            ]);

            $this->bumpStudentsCount($course);

            return $enrollment->load(['course']);
        });
    }

    public function purchaseMany(User $user, array $courseIds): array
    {
        $enrollments = [];
        $skipped = [];

        foreach (array_unique(array_map('intval', $courseIds)) as $courseId) {
            try {
                $enrollments[] = $this->purchase($user, $courseId);
            } catch (ConflictHttpException) {
                $skipped[] = $courseId;
            }
        }

        return [
            'enrollments' => $enrollments,
            'skipped_course_ids' => $skipped,
            'purchased_count' => count($enrollments),
        ];
    }

    /**
     * @throws Throwable
     */
    public function cancel(int $id): Enrollment
    {
        return DB::transaction(function () use ($id): Enrollment {
            $enrollment = $this->findAdmin($id);
            $enrollment->update(['status' => 'cancelled']);

            return $enrollment->refresh();
        });
    }

    private function resolvePrice(Course $course): float
    {
        if ($course->is_free || (float) $course->price <= 0) {
            return 0;
        }

        if ($course->sale_price !== null && (float) $course->sale_price >= 0) {
            return (float) $course->sale_price;
        }

        return (float) $course->price;
    }

    private function bumpStudentsCount(Course $course): void
    {
        $count = Enrollment::query()
            ->withoutGlobalScope('company')
            ->where('course_id', $course->id)
            ->where('status', 'active')
            ->count();

        $course->update(['students_count' => $count]);
    }
}
