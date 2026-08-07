<?php

use Illuminate\Support\Facades\Route;
use Modules\Company\Http\Controllers\CompanyController;

Route::middleware(['auth:sanctum', 'tenant', 'module:company'])->group(function (): void {
    Route::get('companies', [CompanyController::class, 'index'])->middleware('permission:company.view');
    Route::post('companies', [CompanyController::class, 'store'])->middleware('permission:company.create');
    Route::get('companies/{company}', [CompanyController::class, 'show'])->middleware('permission:company.view');
    Route::put('companies/{company}', [CompanyController::class, 'update'])->middleware('permission:company.update');
    Route::patch('companies/{company}', [CompanyController::class, 'update'])->middleware('permission:company.update');
    Route::delete('companies/{company}', [CompanyController::class, 'destroy'])->middleware('permission:company.delete');
    Route::post('companies/{company}/restore', [CompanyController::class, 'restore'])->middleware('permission:company.restore');
});
