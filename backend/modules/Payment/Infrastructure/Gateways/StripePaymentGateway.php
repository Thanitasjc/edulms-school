<?php

namespace Modules\Payment\Infrastructure\Gateways;

use Illuminate\Support\Facades\Http;
use Modules\Payment\Application\Contracts\PaymentGateway;
use Modules\Payment\Domain\Models\Payment;
use RuntimeException;

class StripePaymentGateway implements PaymentGateway
{
    public function name(): string
    {
        return 'stripe';
    }

    public function createCheckoutSession(Payment $payment, string $successUrl, string $cancelUrl): array
    {
        $secret = (string) config('payment.stripe.secret');
        if ($secret === '') {
            throw new RuntimeException('Stripe secret key is not configured.');
        }

        $payment->loadMissing('items');

        $lineItems = [];
        foreach ($payment->items as $item) {
            $lineItems[] = [
                'price_data' => [
                    'currency' => strtolower($payment->currency),
                    'product_data' => [
                        'name' => $item->title,
                    ],
                    'unit_amount' => (int) round(((float) $item->amount) * 100),
                ],
                'quantity' => 1,
            ];
        }

        $payload = [
            'mode' => 'payment',
            'success_url' => $successUrl,
            'cancel_url' => $cancelUrl,
            'client_reference_id' => $payment->uuid,
            'metadata' => [
                'payment_uuid' => $payment->uuid,
                'payment_id' => (string) $payment->id,
            ],
            'line_items' => $lineItems,
        ];

        $response = Http::asForm()
            ->withToken($secret)
            ->post(rtrim((string) config('payment.stripe.api_base'), '/').'/v1/checkout/sessions', $this->flatten($payload));

        if (! $response->successful()) {
            throw new RuntimeException(
                'Stripe checkout session failed: '.$response->json('error.message', $response->body())
            );
        }

        $data = $response->json();

        return [
            'checkout_url' => (string) ($data['url'] ?? ''),
            'external_id' => (string) ($data['id'] ?? ''),
            'meta' => [
                'stripe_session' => $data,
            ],
        ];
    }

    public function isSessionPaid(Payment $payment): bool
    {
        if ($payment->isPaid()) {
            return true;
        }

        $secret = (string) config('payment.stripe.secret');
        $sessionId = (string) ($payment->external_id ?? '');
        if ($secret === '' || $sessionId === '') {
            return false;
        }

        $response = Http::withToken($secret)
            ->get(rtrim((string) config('payment.stripe.api_base'), '/').'/v1/checkout/sessions/'.$sessionId);

        if (! $response->successful()) {
            return false;
        }

        $data = $response->json();

        return ($data['payment_status'] ?? null) === 'paid' || ($data['status'] ?? null) === 'complete';
    }

    /**
     * Flatten nested arrays into Stripe's form-encoded bracket notation.
     *
     * @param  array<string, mixed>  $data
     * @return array<string, scalar>
     */
    private function flatten(array $data, string $prefix = ''): array
    {
        $result = [];

        foreach ($data as $key => $value) {
            $formKey = $prefix === '' ? (string) $key : $prefix.'['.$key.']';

            if (is_array($value)) {
                $result += $this->flatten($value, $formKey);
            } else {
                $result[$formKey] = $value;
            }
        }

        return $result;
    }
}
