<?php

namespace Modules\Course\Http\Controllers;

use App\Core\Support\ApiResponse;
use App\Core\Support\QueryFilter;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Course\Application\Services\CourseService;
use Modules\Course\Domain\Models\Course;
use Modules\Course\Http\Requests\StoreCourseRequest;
use Modules\Course\Http\Requests\UpdateCourseRequest;
use Modules\Course\Http\Resources\CourseResource;

class CourseController extends Controller
{
    public function __construct(
        private readonly CourseService $courseService
    ) {}

    public function index(Request $request): JsonResponse
    {
        abort_unless($request->user()?->can('course.view') || $request->user()?->is_super_admin, 403);

        $paginator = $this->courseService->listAdmin(new QueryFilter($request));

        return ApiResponse::success(
            CourseResource::collection($paginator),
            __('api.course.retrieved_list')
        );
    }

    public function store(StoreCourseRequest $request): JsonResponse
    {
        abort_unless($request->user()?->can('course.create') || $request->user()?->is_super_admin, 403);

        $course = $this->courseService->create($request->validated());

        return ApiResponse::created(
            new CourseResource($course),
            __('api.course.created')
        );
    }

    public function show(Request $request, Course $course): JsonResponse
    {
        abort_unless($request->user()?->can('course.view') || $request->user()?->is_super_admin, 403);

        return ApiResponse::success(
            new CourseResource($course),
            __('api.course.retrieved')
        );
    }

    public function update(UpdateCourseRequest $request, Course $course): JsonResponse
    {
        abort_unless($request->user()?->can('course.update') || $request->user()?->is_super_admin, 403);

        $course = $this->courseService->update($course->id, $request->validated());

        return ApiResponse::success(
            new CourseResource($course),
            __('api.course.updated')
        );
    }

    public function destroy(Request $request, Course $course): JsonResponse
    {
        abort_unless($request->user()?->can('course.delete') || $request->user()?->is_super_admin, 403);

        $this->courseService->delete($course->id);

        return ApiResponse::noContent(__('api.course.deleted'));
    }

    public function restore(Request $request, int $course): JsonResponse
    {
        abort_unless($request->user()?->can('course.restore') || $request->user()?->is_super_admin, 403);

        $restored = $this->courseService->restore($course);

        return ApiResponse::success(
            new CourseResource($restored),
            __('api.course.restored')
        );
    }
}
