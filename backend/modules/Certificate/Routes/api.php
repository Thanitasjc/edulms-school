<?php

use Illuminate\Support\Facades\Route;
use Modules\Certificate\Http\Controllers\CertificateController;
use Modules\Certificate\Http\Controllers\StudentCertificateController;

Route::prefix('public')->group(function (): void {
    Route::get('certificates/{code}', [StudentCertificateController::class, 'showByCode']);
});

Route::middleware(['auth:sanctum'])->group(function (): void {
    Route::get('certificates/mine', [StudentCertificateController::class, 'mine']);
});

Route::middleware(['auth:sanctum', 'tenant', 'module:certificate'])->group(function (): void {
    Route::get('certificates', [CertificateController::class, 'index'])->middleware('permission:certificate.view');
    Route::get('certificates/{certificate}', [CertificateController::class, 'show'])->middleware('permission:certificate.view');
});
