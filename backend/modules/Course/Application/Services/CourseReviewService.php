<?php

namespace Modules\Course\Application\Services;

use App\Core\Support\QueryFilter;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Modules\Course\Domain\Models\Course;
use Modules\Course\Domain\Models\CourseReview;
use Symfony\Component\HttpKernel\Exception\ConflictHttpException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Throwable;

class CourseReviewService
{
    public function listPublicByCourseSlug(string $slug, QueryFilter $queryFilter): LengthAwarePaginator
    {
        $course = Course::query()
            ->withoutGlobalScope('company')
            ->published()
            ->where('slug', $slug)
            ->firstOrFail();

        $query = CourseReview::query()
            ->withoutGlobalScope('company')
            ->with('user')
            ->where('course_id', $course->id)
            ->where('status', 'approved')
            ->orderByDesc('created_at');

        $queryFilter->apply(
            $query,
            searchable: ['title', 'body'],
            filterable: ['rating'],
            sortable: ['id', 'rating', 'created_at']
        );

        return $query->paginate($queryFilter->perPage());
    }

    public function listAdmin(QueryFilter $queryFilter): LengthAwarePaginator
    {
        $query = CourseReview::query()->with(['course', 'user']);

        $queryFilter->apply(
            $query,
            searchable: ['title', 'body'],
            filterable: ['status', 'course_id', 'rating'],
            sortable: ['id', 'rating', 'created_at', 'updated_at']
        );

        return $query->paginate($queryFilter->perPage());
    }

    public function findAdmin(int $id): CourseReview
    {
        /** @var CourseReview $review */
        $review = CourseReview::query()->with(['course', 'user'])->findOrFail($id);

        return $review;
    }

    /**
     * @throws Throwable
     */
    public function createPublic(User $user, string $courseSlug, array $data): CourseReview
    {
        return DB::transaction(function () use ($user, $courseSlug, $data): CourseReview {
            /** @var Course|null $course */
            $course = Course::query()
                ->withoutGlobalScope('company')
                ->published()
                ->where('slug', $courseSlug)
                ->first();

            if ($course === null) {
                throw new NotFoundHttpException(__('api.course.retrieved'));
            }

            $exists = CourseReview::withTrashed()
                ->withoutGlobalScope('company')
                ->where('course_id', $course->id)
                ->where('user_id', $user->id)
                ->exists();

            if ($exists) {
                throw new ConflictHttpException(__('api.review.already_reviewed'));
            }

            /** @var CourseReview $review */
            $review = CourseReview::query()->create([
                'company_id' => $course->company_id,
                'course_id' => $course->id,
                'user_id' => $user->id,
                'rating' => (int) $data['rating'],
                'title' => $data['title'] ?? null,
                'body' => $data['body'] ?? null,
                'status' => 'approved',
            ]);

            $this->syncCourseRating($course);

            return $review->load('user');
        });
    }

    /**
     * @throws Throwable
     */
    public function createAdmin(array $data): CourseReview
    {
        return DB::transaction(function () use ($data): CourseReview {
            $course = Course::query()->findOrFail($data['course_id']);

            /** @var CourseReview $review */
            $review = CourseReview::query()->create([
                'company_id' => $course->company_id,
                'course_id' => $course->id,
                'user_id' => $data['user_id'],
                'rating' => (int) $data['rating'],
                'title' => $data['title'] ?? null,
                'body' => $data['body'] ?? null,
                'status' => $data['status'] ?? 'approved',
            ]);

            $this->syncCourseRating($course);

            return $review->load(['course', 'user']);
        });
    }

    /**
     * @throws Throwable
     */
    public function update(int $id, array $data): CourseReview
    {
        return DB::transaction(function () use ($id, $data): CourseReview {
            $review = $this->findAdmin($id);
            $review->update($data);
            $this->syncCourseRating($review->course()->withoutGlobalScope('company')->first() ?? $review->course);

            return $review->refresh()->load(['course', 'user']);
        });
    }

    /**
     * @throws Throwable
     */
    public function delete(int $id): bool
    {
        return DB::transaction(function () use ($id): bool {
            $review = $this->findAdmin($id);
            $course = $review->course;
            $deleted = (bool) $review->delete();
            if ($course) {
                $this->syncCourseRating($course);
            }

            return $deleted;
        });
    }

    private function syncCourseRating(Course $course): void
    {
        $stats = CourseReview::query()
            ->withoutGlobalScope('company')
            ->where('course_id', $course->id)
            ->where('status', 'approved')
            ->selectRaw('COUNT(*) as total, COALESCE(AVG(rating), 0) as avg_rating')
            ->first();

        $course->update([
            'reviews_count' => (int) ($stats->total ?? 0),
            'rating' => round((float) ($stats->avg_rating ?? 0), 2),
        ]);
    }
}
