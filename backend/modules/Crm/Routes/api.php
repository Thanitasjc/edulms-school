<?php

use Illuminate\Support\Facades\Route;
use Modules\Crm\Http\Controllers\LeadController;
use Modules\Crm\Http\Controllers\PublicLeadController;

Route::prefix('public')->group(function (): void {
    Route::post('leads', [PublicLeadController::class, 'store']);
});

Route::middleware(['auth:sanctum', 'tenant', 'module:crm'])->group(function (): void {
    Route::get('leads', [LeadController::class, 'index'])->middleware('permission:crm.view');
    Route::get('leads/{lead}', [LeadController::class, 'show'])->middleware('permission:crm.view');
    Route::patch('leads/{lead}/status', [LeadController::class, 'updateStatus'])->middleware('permission:crm.update');
    Route::put('leads/{lead}/status', [LeadController::class, 'updateStatus'])->middleware('permission:crm.update');
    Route::delete('leads/{lead}', [LeadController::class, 'destroy'])->middleware('permission:crm.delete');
});
