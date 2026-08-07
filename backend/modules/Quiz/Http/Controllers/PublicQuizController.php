<?php

namespace Modules\Quiz\Http\Controllers;

use App\Core\Support\ApiResponse;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Modules\Quiz\Application\Services\QuizService;
use Modules\Quiz\Http\Resources\QuizResource;

class PublicQuizController extends Controller
{
    public function __construct(
        private readonly QuizService $quizService
    ) {}

    public function indexByCourse(string $slug): JsonResponse
    {
        $quizzes = $this->quizService->listPublicByCourseSlug($slug);

        return ApiResponse::success(
            $quizzes->map(fn ($quiz) => new QuizResource($quiz, false))->values(),
            __('api.quiz.retrieved_list')
        );
    }

    public function show(int $quiz): JsonResponse
    {
        return ApiResponse::success(
            new QuizResource($this->quizService->getPublicQuiz($quiz), false),
            __('api.quiz.retrieved')
        );
    }
}
