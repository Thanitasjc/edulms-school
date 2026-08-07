<?php

use Illuminate\Support\Facades\Route;
use Modules\Cms\Http\Controllers\CategoryController;
use Modules\Cms\Http\Controllers\HeroSlideController;

Route::prefix('public')->group(function (): void {
    Route::get('categories', [CategoryController::class, 'publicIndex']);
    Route::get('hero-slides', [HeroSlideController::class, 'publicIndex']);
});

Route::middleware(['auth:sanctum', 'tenant', 'module:cms'])->group(function (): void {
    Route::get('categories', [CategoryController::class, 'index'])->middleware('permission:cms.view');
    Route::post('categories', [CategoryController::class, 'store'])->middleware('permission:cms.create');
    Route::put('categories/{category}', [CategoryController::class, 'update'])->middleware('permission:cms.update');
    Route::patch('categories/{category}', [CategoryController::class, 'update'])->middleware('permission:cms.update');
    Route::delete('categories/{category}', [CategoryController::class, 'destroy'])->middleware('permission:cms.delete');

    Route::get('hero-slides', [HeroSlideController::class, 'index'])->middleware('permission:cms.view');
    Route::post('hero-slides', [HeroSlideController::class, 'store'])->middleware('permission:cms.create');
    Route::put('hero-slides/{heroSlide}', [HeroSlideController::class, 'update'])->middleware('permission:cms.update');
    Route::patch('hero-slides/{heroSlide}', [HeroSlideController::class, 'update'])->middleware('permission:cms.update');
    Route::delete('hero-slides/{heroSlide}', [HeroSlideController::class, 'destroy'])->middleware('permission:cms.delete');
});
