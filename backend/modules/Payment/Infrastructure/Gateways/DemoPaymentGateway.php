<?php

namespace Modules\Payment\Infrastructure\Gateways;

use Modules\Payment\Application\Contracts\PaymentGateway;
use Modules\Payment\Domain\Models\Payment;

class DemoPaymentGateway implements PaymentGateway
{
    public function name(): string
    {
        return 'demo';
    }

    public function createCheckoutSession(Payment $payment, string $successUrl, string $cancelUrl): array
    {
        $frontend = rtrim((string) config('payment.frontend_url'), '/');

        return [
            'checkout_url' => $frontend.'/checkout/pay/'.$payment->uuid,
            'external_id' => 'demo_'.$payment->uuid,
            'meta' => [
                'success_url' => $successUrl,
                'cancel_url' => $cancelUrl,
                'mode' => 'demo',
            ],
        ];
    }

    public function isSessionPaid(Payment $payment): bool
    {
        return $payment->isPaid();
    }
}
