<?php

namespace Modules\Instructor\Http\Controllers;

use App\Core\Support\ApiResponse;
use App\Core\Support\QueryFilter;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Instructor\Application\Services\InstructorService;
use Modules\Instructor\Http\Resources\InstructorResource;

class PublicInstructorController extends Controller
{
    public function __construct(
        private readonly InstructorService $instructorService
    ) {}

    public function index(Request $request): JsonResponse
    {
        if ($request->boolean('featured_home')) {
            $instructors = $this->instructorService->listPublic((int) $request->integer('limit', 8));

            return ApiResponse::success(
                InstructorResource::collection($instructors),
                __('api.instructor.retrieved_list')
            );
        }

        $paginator = $this->instructorService->paginatePublic(new QueryFilter($request));

        return ApiResponse::success(
            InstructorResource::collection($paginator),
            __('api.instructor.retrieved_list')
        );
    }

    public function show(string $slug): JsonResponse
    {
        $instructor = $this->instructorService->findPublishedBySlug($slug);

        return ApiResponse::success(
            new InstructorResource($instructor),
            __('api.instructor.retrieved')
        );
    }
}
