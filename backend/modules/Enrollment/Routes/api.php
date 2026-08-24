<?php

use Illuminate\Support\Facades\Route;
use Modules\Enrollment\Http\Controllers\EnrollmentController;
use Modules\Enrollment\Http\Controllers\ProgressController;

Route::middleware(['auth:sanctum'])->group(function (): void {
    Route::get('enrollments/mine', [EnrollmentController::class, 'mine']);
    Route::post('enrollments/purchase', [EnrollmentController::class, 'purchase']);
    Route::post('enrollments/checkout', [EnrollmentController::class, 'checkout']);

    Route::get('progress/courses/{slug}', [ProgressController::class, 'show']);
    Route::post('progress/courses/{slug}/lessons', [ProgressController::class, 'track']);
});

Route::middleware(['auth:sanctum', 'tenant', 'module:enrollment'])->group(function (): void {
    Route::get('enrollments', [EnrollmentController::class, 'index'])->middleware('permission:enrollment.view');
    Route::post('enrollments', [EnrollmentController::class, 'store'])->middleware('permission:enrollment.create');
    Route::get('enrollments/{enrollment}', [EnrollmentController::class, 'show'])->middleware('permission:enrollment.view');
    Route::put('enrollments/{enrollment}', [EnrollmentController::class, 'update'])->middleware('permission:enrollment.update');
    Route::patch('enrollments/{enrollment}', [EnrollmentController::class, 'update'])->middleware('permission:enrollment.update');
    Route::post('enrollments/{enrollment}/cancel', [EnrollmentController::class, 'cancel'])->middleware('permission:enrollment.update');
    Route::delete('enrollments/{enrollment}', [EnrollmentController::class, 'destroy'])->middleware('permission:enrollment.delete');
});
