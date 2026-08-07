<?php

namespace Modules\Quiz\Http\Controllers;

use App\Core\Support\ApiResponse;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Quiz\Application\Services\QuizService;
use Modules\Quiz\Http\Resources\QuizAttemptResource;

class StudentQuizController extends Controller
{
    public function __construct(
        private readonly QuizService $quizService
    ) {}

    public function submit(Request $request, int $quiz): JsonResponse
    {
        $data = $request->validate([
            'answers' => ['required', 'array'],
            'answers.*' => ['nullable', 'string', 'max:50'],
        ]);

        $result = $this->quizService->submitAttempt(
            $request->user(),
            $quiz,
            $data['answers']
        );

        return ApiResponse::success([
            'score' => $result['score'],
            'passed' => $result['passed'],
            'attempt' => new QuizAttemptResource($result['attempt']),
        ], __('api.quiz.attempt_submitted'));
    }
}
