<?php

use Illuminate\Support\Facades\Route;
use Modules\Instructor\Http\Controllers\InstructorController;
use Modules\Instructor\Http\Controllers\PublicInstructorController;

Route::prefix('public')->group(function (): void {
    Route::get('instructors', [PublicInstructorController::class, 'index']);
    Route::get('instructors/{slug}', [PublicInstructorController::class, 'show']);
});

Route::middleware(['auth:sanctum', 'tenant', 'module:instructor'])->group(function (): void {
    Route::get('instructors', [InstructorController::class, 'index'])->middleware('permission:instructor.view');
    Route::post('instructors', [InstructorController::class, 'store'])->middleware('permission:instructor.create');
    Route::get('instructors/{instructor}', [InstructorController::class, 'show'])->middleware('permission:instructor.view');
    Route::put('instructors/{instructor}', [InstructorController::class, 'update'])->middleware('permission:instructor.update');
    Route::patch('instructors/{instructor}', [InstructorController::class, 'update'])->middleware('permission:instructor.update');
    Route::delete('instructors/{instructor}', [InstructorController::class, 'destroy'])->middleware('permission:instructor.delete');
    Route::post('instructors/{instructor}/restore', [InstructorController::class, 'restore'])->middleware('permission:instructor.restore');
});
