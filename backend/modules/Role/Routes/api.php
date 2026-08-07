<?php

use Illuminate\Support\Facades\Route;
use Modules\Role\Http\Controllers\RoleController;

Route::middleware(['auth:sanctum', 'tenant', 'module:role'])->group(function (): void {
    Route::get('roles', [RoleController::class, 'index'])->middleware('permission:role.view');
    Route::post('roles', [RoleController::class, 'store'])->middleware('permission:role.create');
    Route::get('roles/{role}', [RoleController::class, 'show'])->middleware('permission:role.view');
    Route::put('roles/{role}', [RoleController::class, 'update'])->middleware('permission:role.update');
    Route::patch('roles/{role}', [RoleController::class, 'update'])->middleware('permission:role.update');
    Route::delete('roles/{role}', [RoleController::class, 'destroy'])->middleware('permission:role.delete');
    Route::get('permissions', [RoleController::class, 'permissions'])->middleware('permission:permission.view');
});
