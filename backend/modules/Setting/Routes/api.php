<?php

use Illuminate\Support\Facades\Route;
use Modules\Setting\Http\Controllers\SettingController;

Route::middleware(['auth:sanctum', 'tenant', 'module:setting'])->group(function (): void {
    Route::get('settings', [SettingController::class, 'index'])->middleware('permission:setting.view');
    Route::post('settings', [SettingController::class, 'store'])->middleware('permission:setting.create');
    Route::put('settings/{setting}', [SettingController::class, 'update'])->middleware('permission:setting.update');
    Route::patch('settings/{setting}', [SettingController::class, 'update'])->middleware('permission:setting.update');
    Route::delete('settings/{setting}', [SettingController::class, 'destroy'])->middleware('permission:setting.delete');
    Route::post('settings/{setting}/restore', [SettingController::class, 'restore'])->middleware('permission:setting.restore');
});
