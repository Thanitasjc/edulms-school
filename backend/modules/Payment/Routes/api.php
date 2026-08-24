<?php

use Illuminate\Support\Facades\Route;
use Modules\Payment\Http\Controllers\PaymentController;

Route::post('payments/webhook/stripe', [PaymentController::class, 'stripeWebhook']);

Route::middleware(['auth:sanctum'])->group(function (): void {
    Route::post('payments/checkout', [PaymentController::class, 'checkout']);
    Route::get('payments/{payment}', [PaymentController::class, 'show']);
    Route::post('payments/{payment}/confirm', [PaymentController::class, 'confirm']);
    Route::post('payments/{payment}/sync', [PaymentController::class, 'sync']);
});

Route::middleware(['auth:sanctum', 'tenant', 'module:payment'])->group(function (): void {
    Route::get('payments', [PaymentController::class, 'index'])->middleware('permission:payment.view');
});
