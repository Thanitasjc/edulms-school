<?php

namespace Modules\Course\Http\Controllers;

use App\Core\Support\ApiResponse;
use App\Core\Support\QueryFilter;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Course\Application\Services\CourseService;
use Modules\Course\Http\Resources\CourseResource;

class PublicCourseController extends Controller
{
    public function __construct(
        private readonly CourseService $courseService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $tab = $request->query('tab');
        $tab = is_string($tab) ? $tab : null;

        if ($request->boolean('featured_home')) {
            $courses = $this->courseService->listPublic($tab, (int) $request->integer('limit', 6));

            return ApiResponse::success(
                CourseResource::collection($courses),
                __('api.course.retrieved_list')
            );
        }

        $paginator = $this->courseService->paginatePublic(new QueryFilter($request), $tab);

        return ApiResponse::success(
            CourseResource::collection($paginator),
            __('api.course.retrieved_list')
        );
    }

    public function show(string $slug): JsonResponse
    {
        $course = $this->courseService->findPublishedBySlug($slug);

        return ApiResponse::success(
            new CourseResource($course),
            __('api.course.retrieved')
        );
    }
}
