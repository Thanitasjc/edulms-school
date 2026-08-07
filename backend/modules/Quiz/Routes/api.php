<?php

use Illuminate\Support\Facades\Route;
use Modules\Quiz\Http\Controllers\PublicQuizController;
use Modules\Quiz\Http\Controllers\QuizController;
use Modules\Quiz\Http\Controllers\StudentQuizController;

Route::prefix('public')->group(function (): void {
    Route::get('courses/{slug}/quizzes', [PublicQuizController::class, 'indexByCourse']);
    Route::get('quizzes/{quiz}', [PublicQuizController::class, 'show']);
});

Route::middleware(['auth:sanctum'])->group(function (): void {
    Route::post('public/quizzes/{quiz}/attempts', [StudentQuizController::class, 'submit']);
});

Route::middleware(['auth:sanctum', 'tenant', 'module:quiz'])->group(function (): void {
    Route::get('quizzes', [QuizController::class, 'index'])->middleware('permission:quiz.view');
    Route::post('quizzes', [QuizController::class, 'store'])->middleware('permission:quiz.create');
    Route::get('quizzes/{quiz}', [QuizController::class, 'show'])->middleware('permission:quiz.view');
    Route::put('quizzes/{quiz}', [QuizController::class, 'update'])->middleware('permission:quiz.update');
    Route::patch('quizzes/{quiz}', [QuizController::class, 'update'])->middleware('permission:quiz.update');
    Route::delete('quizzes/{quiz}', [QuizController::class, 'destroy'])->middleware('permission:quiz.delete');
});
