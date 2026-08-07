<?php

namespace Modules\Course\Http\Controllers;

use App\Core\Support\ApiResponse;
use App\Core\Support\QueryFilter;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Course\Application\Services\CourseReviewService;
use Modules\Course\Domain\Models\CourseReview;
use Modules\Course\Http\Requests\AdminStoreCourseReviewRequest;
use Modules\Course\Http\Requests\StoreCourseReviewRequest;
use Modules\Course\Http\Requests\UpdateCourseReviewRequest;
use Modules\Course\Http\Resources\CourseReviewResource;

class CourseReviewController extends Controller
{
    public function __construct(
        private readonly CourseReviewService $reviewService
    ) {}

    public function publicIndex(Request $request, string $slug): JsonResponse
    {
        $paginator = $this->reviewService->listPublicByCourseSlug($slug, new QueryFilter($request));

        return ApiResponse::success(
            CourseReviewResource::collection($paginator),
            __('api.review.retrieved_list')
        );
    }

    public function publicStore(StoreCourseReviewRequest $request, string $slug): JsonResponse
    {
        $review = $this->reviewService->createPublic(
            $request->user(),
            $slug,
            $request->validated()
        );

        return ApiResponse::created(
            new CourseReviewResource($review),
            __('api.review.created')
        );
    }

    public function index(Request $request): JsonResponse
    {
        abort_unless($request->user()?->can('course.view') || $request->user()?->is_super_admin, 403);

        $paginator = $this->reviewService->listAdmin(new QueryFilter($request));

        return ApiResponse::success(
            CourseReviewResource::collection($paginator),
            __('api.review.retrieved_list')
        );
    }

    public function store(AdminStoreCourseReviewRequest $request): JsonResponse
    {
        $review = $this->reviewService->createAdmin($request->validated());

        return ApiResponse::created(
            new CourseReviewResource($review),
            __('api.review.created')
        );
    }

    public function update(UpdateCourseReviewRequest $request, CourseReview $review): JsonResponse
    {
        $review = $this->reviewService->update($review->id, $request->validated());

        return ApiResponse::success(
            new CourseReviewResource($review),
            __('api.review.updated')
        );
    }

    public function destroy(Request $request, CourseReview $review): JsonResponse
    {
        abort_unless($request->user()?->can('course.delete') || $request->user()?->is_super_admin, 403);

        $this->reviewService->delete($review->id);

        return ApiResponse::noContent(__('api.review.deleted'));
    }
}
