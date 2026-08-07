<?php

use Illuminate\Support\Facades\Route;
use Modules\Course\Http\Controllers\CourseController;
use Modules\Course\Http\Controllers\CourseMediaController;
use Modules\Course\Http\Controllers\CourseReviewController;
use Modules\Course\Http\Controllers\PublicCourseController;

Route::prefix('public')->middleware('auth.optional')->group(function (): void {
    Route::get('courses', [PublicCourseController::class, 'index']);
    Route::get('courses/{slug}', [PublicCourseController::class, 'show']);
    Route::get('courses/{slug}/reviews', [CourseReviewController::class, 'publicIndex']);
});

Route::middleware(['auth:sanctum'])->group(function (): void {
    Route::post('public/courses/{slug}/reviews', [CourseReviewController::class, 'publicStore']);
});

Route::middleware(['auth:sanctum', 'tenant', 'module:course'])->group(function (): void {
    Route::post('courses/media/video', [CourseMediaController::class, 'uploadVideo']);
    Route::post('courses/media/image', [CourseMediaController::class, 'uploadImage']);
    Route::get('courses', [CourseController::class, 'index'])->middleware('permission:course.view');
    Route::post('courses', [CourseController::class, 'store'])->middleware('permission:course.create');
    Route::get('courses/{course}', [CourseController::class, 'show'])->middleware('permission:course.view');
    Route::put('courses/{course}', [CourseController::class, 'update'])->middleware('permission:course.update');
    Route::patch('courses/{course}', [CourseController::class, 'update'])->middleware('permission:course.update');
    Route::delete('courses/{course}', [CourseController::class, 'destroy'])->middleware('permission:course.delete');
    Route::post('courses/{course}/restore', [CourseController::class, 'restore'])->middleware('permission:course.restore');

    Route::get('course-reviews', [CourseReviewController::class, 'index'])->middleware('permission:course.view');
    Route::post('course-reviews', [CourseReviewController::class, 'store'])->middleware('permission:course.update');
    Route::put('course-reviews/{review}', [CourseReviewController::class, 'update'])->middleware('permission:course.update');
    Route::patch('course-reviews/{review}', [CourseReviewController::class, 'update'])->middleware('permission:course.update');
    Route::delete('course-reviews/{review}', [CourseReviewController::class, 'destroy'])->middleware('permission:course.delete');
});
