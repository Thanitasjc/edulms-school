<?php

namespace Modules\Enrollment\Http\Controllers;

use App\Core\Support\ApiResponse;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Modules\Enrollment\Application\Services\ProgressService;

class ProgressController extends Controller
{
    public function __construct(
        private readonly ProgressService $progressService
    ) {}

    public function show(Request $request, string $slug): JsonResponse
    {
        $summary = $this->progressService->summaryForCourse($request->user(), $slug);

        return ApiResponse::success($summary, __('api.progress.retrieved'));
    }

    public function track(Request $request, string $slug): JsonResponse
    {
        $data = $request->validate([
            'section_index' => ['required', 'integer', 'min:0'],
            'lesson_index' => ['required', 'integer', 'min:0'],
            'lesson_title' => ['nullable', 'string', 'max:255'],
            'status' => ['nullable', Rule::in(['in_progress', 'completed'])],
        ]);

        $summary = $this->progressService->trackLesson(
            $request->user(),
            $slug,
            (int) $data['section_index'],
            (int) $data['lesson_index'],
            $data['status'] ?? 'in_progress',
            $data['lesson_title'] ?? null
        );

        return ApiResponse::success($summary, __('api.progress.updated'));
    }
}
