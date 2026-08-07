<?php

namespace Modules\Quiz\Http\Controllers;

use App\Core\Support\ApiResponse;
use App\Core\Support\QueryFilter;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Modules\Quiz\Application\Services\QuizService;
use Modules\Quiz\Domain\Models\Quiz;
use Modules\Quiz\Http\Resources\QuizResource;

class QuizController extends Controller
{
    public function __construct(
        private readonly QuizService $quizService
    ) {}

    public function index(Request $request): JsonResponse
    {
        abort_unless($request->user()?->can('quiz.view') || $request->user()?->is_super_admin, 403);

        $paginator = $this->quizService->listAdmin(new QueryFilter($request));
        $paginator->setCollection(
            $paginator->getCollection()->map(fn ($quiz) => new QuizResource($quiz, true))
        );

        return ApiResponse::success(
            QuizResource::collection($paginator),
            __('api.quiz.retrieved_list')
        );
    }

    public function store(Request $request): JsonResponse
    {
        abort_unless($request->user()?->can('quiz.create') || $request->user()?->is_super_admin, 403);

        $data = $request->validate([
            'course_id' => ['required', 'integer', 'exists:courses,id'],
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'pass_percentage' => ['nullable', 'integer', 'min:1', 'max:100'],
            'lesson_key' => ['nullable', 'string', 'max:255'],
            'status' => ['nullable', Rule::in(['draft', 'published', 'archived'])],
            'questions' => ['required', 'array', 'min:1'],
            'questions.*.question' => ['required', 'string'],
            'questions.*.options' => ['required', 'array', 'min:2'],
            'questions.*.options.*.key' => ['required', 'string', 'max:50'],
            'questions.*.options.*.text' => ['required', 'string'],
            'questions.*.correct_option' => ['required', 'string', 'max:50'],
            'questions.*.sort_order' => ['nullable', 'integer', 'min:0'],
        ]);

        $quiz = $this->quizService->create($data);

        return ApiResponse::created(
            new QuizResource($quiz, true),
            __('api.quiz.created')
        );
    }

    public function show(Request $request, Quiz $quiz): JsonResponse
    {
        abort_unless($request->user()?->can('quiz.view') || $request->user()?->is_super_admin, 403);

        return ApiResponse::success(
            new QuizResource($this->quizService->findAdmin($quiz->id), true),
            __('api.quiz.retrieved')
        );
    }

    public function update(Request $request, Quiz $quiz): JsonResponse
    {
        abort_unless($request->user()?->can('quiz.update') || $request->user()?->is_super_admin, 403);

        $data = $request->validate([
            'course_id' => ['sometimes', 'required', 'integer', 'exists:courses,id'],
            'title' => ['sometimes', 'required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'pass_percentage' => ['nullable', 'integer', 'min:1', 'max:100'],
            'lesson_key' => ['nullable', 'string', 'max:255'],
            'status' => ['nullable', Rule::in(['draft', 'published', 'archived'])],
            'questions' => ['sometimes', 'array', 'min:1'],
            'questions.*.question' => ['required_with:questions', 'string'],
            'questions.*.options' => ['required_with:questions', 'array', 'min:2'],
            'questions.*.options.*.key' => ['required', 'string', 'max:50'],
            'questions.*.options.*.text' => ['required', 'string'],
            'questions.*.correct_option' => ['required_with:questions', 'string', 'max:50'],
            'questions.*.sort_order' => ['nullable', 'integer', 'min:0'],
        ]);

        $quiz = $this->quizService->update($quiz->id, $data);

        return ApiResponse::success(
            new QuizResource($quiz, true),
            __('api.quiz.updated')
        );
    }

    public function destroy(Request $request, Quiz $quiz): JsonResponse
    {
        abort_unless($request->user()?->can('quiz.delete') || $request->user()?->is_super_admin, 403);

        $this->quizService->delete($quiz->id);

        return ApiResponse::noContent(__('api.quiz.deleted'));
    }
}
