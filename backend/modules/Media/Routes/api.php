<?php

use Illuminate\Support\Facades\Route;
use Modules\Media\Http\Controllers\MediaController;

Route::middleware(['auth:sanctum', 'tenant'])->group(function (): void {
    Route::post('media/upload', [MediaController::class, 'upload']);
});

Route::middleware(['auth:sanctum', 'tenant', 'module:media'])->group(function (): void {
    Route::get('media', [MediaController::class, 'index'])->middleware('permission:media.view');
    Route::post('media', [MediaController::class, 'store'])->middleware('permission:media.create');
    Route::delete('media/{mediaAsset}', [MediaController::class, 'destroy'])->middleware('permission:media.delete');
});
