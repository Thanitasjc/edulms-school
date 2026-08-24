<?php

namespace Modules\Payment\Application\Contracts;

use Modules\Payment\Domain\Models\Payment;

interface PaymentGateway
{
    public function name(): string;

    /**
     * Create a hosted checkout session and return checkout URL + external id.
     *
     * @return array{checkout_url: string, external_id: string|null, meta?: array}
     */
    public function createCheckoutSession(Payment $payment, string $successUrl, string $cancelUrl): array;

    /**
     * Verify remote payment status and return whether it is paid.
     */
    public function isSessionPaid(Payment $payment): bool;
}
