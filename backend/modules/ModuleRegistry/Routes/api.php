<?php

use Illuminate\Support\Facades\Route;
use Modules\ModuleRegistry\Http\Controllers\ModuleRegistryController;

Route::middleware(['auth:sanctum', 'tenant'])->group(function (): void {
    Route::get('modules', [ModuleRegistryController::class, 'index']);
    Route::get('bootstrap', [ModuleRegistryController::class, 'bootstrap']);
});
