<?php

use Illuminate\Support\Facades\Route;
use Modules\Blog\Http\Controllers\BlogController;
use Modules\Blog\Http\Controllers\PublicBlogController;

Route::prefix('public')->group(function (): void {
    Route::get('blog', [PublicBlogController::class, 'index']);
    Route::get('blog/{slug}', [PublicBlogController::class, 'show']);
});

Route::middleware(['auth:sanctum', 'tenant', 'module:blog'])->group(function (): void {
    Route::get('blog-posts', [BlogController::class, 'index'])->middleware('permission:blog.view');
    Route::post('blog-posts', [BlogController::class, 'store'])->middleware('permission:blog.create');
    Route::get('blog-posts/{blogPost}', [BlogController::class, 'show'])->middleware('permission:blog.view');
    Route::put('blog-posts/{blogPost}', [BlogController::class, 'update'])->middleware('permission:blog.update');
    Route::patch('blog-posts/{blogPost}', [BlogController::class, 'update'])->middleware('permission:blog.update');
    Route::delete('blog-posts/{blogPost}', [BlogController::class, 'destroy'])->middleware('permission:blog.delete');
});
