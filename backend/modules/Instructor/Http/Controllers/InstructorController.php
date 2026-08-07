<?php

namespace Modules\Instructor\Http\Controllers;

use App\Core\Support\ApiResponse;
use App\Core\Support\QueryFilter;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Instructor\Application\Services\InstructorService;
use Modules\Instructor\Domain\Models\Instructor;
use Modules\Instructor\Http\Requests\StoreInstructorRequest;
use Modules\Instructor\Http\Requests\UpdateInstructorRequest;
use Modules\Instructor\Http\Resources\InstructorResource;

class InstructorController extends Controller
{
    public function __construct(
        private readonly InstructorService $instructorService
    ) {}

    public function index(Request $request): JsonResponse
    {
        abort_unless($request->user()?->can('instructor.view') || $request->user()?->is_super_admin, 403);

        $paginator = $this->instructorService->listAdmin(new QueryFilter($request));

        return ApiResponse::success(
            InstructorResource::collection($paginator),
            __('api.instructor.retrieved_list')
        );
    }

    public function store(StoreInstructorRequest $request): JsonResponse
    {
        abort_unless($request->user()?->can('instructor.create') || $request->user()?->is_super_admin, 403);

        $instructor = $this->instructorService->create($request->validated());

        return ApiResponse::created(
            new InstructorResource($instructor),
            __('api.instructor.created')
        );
    }

    public function show(Request $request, Instructor $instructor): JsonResponse
    {
        abort_unless($request->user()?->can('instructor.view') || $request->user()?->is_super_admin, 403);

        return ApiResponse::success(
            new InstructorResource($instructor),
            __('api.instructor.retrieved')
        );
    }

    public function update(UpdateInstructorRequest $request, Instructor $instructor): JsonResponse
    {
        abort_unless($request->user()?->can('instructor.update') || $request->user()?->is_super_admin, 403);

        $instructor = $this->instructorService->update($instructor->id, $request->validated());

        return ApiResponse::success(
            new InstructorResource($instructor),
            __('api.instructor.updated')
        );
    }

    public function destroy(Request $request, Instructor $instructor): JsonResponse
    {
        abort_unless($request->user()?->can('instructor.delete') || $request->user()?->is_super_admin, 403);

        $this->instructorService->delete($instructor->id);

        return ApiResponse::noContent(__('api.instructor.deleted'));
    }

    public function restore(Request $request, int $instructor): JsonResponse
    {
        abort_unless($request->user()?->can('instructor.restore') || $request->user()?->is_super_admin, 403);

        $restored = $this->instructorService->restore($instructor);

        return ApiResponse::success(
            new InstructorResource($restored),
            __('api.instructor.restored')
        );
    }
}
