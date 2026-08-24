<?php

namespace Modules\Payment\Http\Controllers;

use App\Core\Support\ApiResponse;
use App\Core\Support\QueryFilter;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Modules\Enrollment\Http\Resources\EnrollmentResource;
use Modules\Payment\Application\Services\PaymentService;
use Modules\Payment\Http\Requests\CheckoutPaymentRequest;
use Modules\Payment\Http\Resources\PaymentResource;

class PaymentController extends Controller
{
    public function __construct(
        private readonly PaymentService $paymentService
    ) {}

    public function index(Request $request): JsonResponse
    {
        abort_unless($request->user()?->can('payment.view') || $request->user()?->is_super_admin, 403);

        $paginator = $this->paymentService->listAdmin(new QueryFilter($request));

        return ApiResponse::success(
            PaymentResource::collection($paginator),
            __('api.payment.retrieved_list')
        );
    }

    public function checkout(CheckoutPaymentRequest $request): JsonResponse
    {
        $result = $this->paymentService->checkout(
            $request->user(),
            $request->validated('course_ids')
        );

        $payment = $result['payment'] ?? null;

        return ApiResponse::created(
            [
                'mode' => $result['mode'],
                'checkout_url' => $result['checkout_url'],
                'payment' => $payment ? new PaymentResource($payment) : null,
                'enrollments' => EnrollmentResource::collection(collect($result['enrollments'])),
                'skipped_course_ids' => $result['skipped_course_ids'],
                'purchased_count' => $result['purchased_count'],
            ],
            $result['mode'] === 'payment_required'
                ? __('api.payment.checkout_created')
                : __('api.enrollment.checkout_completed')
        );
    }

    public function show(Request $request, string $payment): JsonResponse
    {
        $user = $request->user();
        abort_unless($user !== null, 401);

        if ($user->can('payment.view') || $user->is_super_admin) {
            $model = $this->paymentService->findByUuid($payment);
        } else {
            $model = $this->paymentService->findByUuidForUser($payment, $user);
        }

        return ApiResponse::success(
            new PaymentResource($model->loadMissing(['items.course', 'user'])),
            __('api.payment.retrieved')
        );
    }

    public function confirm(Request $request, string $payment): JsonResponse
    {
        $model = $this->paymentService->findByUuidForUser($payment, $request->user());
        $model = $this->paymentService->confirmDemo($model, $request->user());

        return ApiResponse::success(
            new PaymentResource($model),
            __('api.payment.paid')
        );
    }

    public function sync(Request $request, string $payment): JsonResponse
    {
        $model = $this->paymentService->findByUuidForUser($payment, $request->user());
        $model = $this->paymentService->sync($model, $request->user());

        return ApiResponse::success(
            new PaymentResource($model),
            $model->isPaid() ? __('api.payment.paid') : __('api.payment.pending')
        );
    }

    public function stripeWebhook(Request $request): JsonResponse
    {
        $payload = $request->getContent();
        $signature = (string) $request->header('Stripe-Signature', '');
        $secret = (string) config('payment.stripe.webhook_secret');

        if ($secret !== '' && ! $this->verifyStripeSignature($payload, $signature, $secret)) {
            Log::warning('Stripe webhook signature verification failed');

            return ApiResponse::error(__('api.payment.invalid_webhook'), 400, null, 'InvalidSignature');
        }

        $event = json_decode($payload, true);
        if (! is_array($event)) {
            return ApiResponse::error(__('api.payment.invalid_webhook'), 400);
        }

        $type = $event['type'] ?? null;
        $object = $event['data']['object'] ?? [];

        if (in_array($type, ['checkout.session.completed', 'checkout.session.async_payment_succeeded'], true)) {
            $sessionId = (string) ($object['id'] ?? '');
            $paymentStatus = $object['payment_status'] ?? null;

            if ($sessionId !== '' && ($paymentStatus === 'paid' || ($object['status'] ?? null) === 'complete')) {
                $this->paymentService->completeFromExternalId($sessionId);
            }
        }

        return ApiResponse::success(['received' => true], __('api.ok'));
    }

    private function verifyStripeSignature(string $payload, string $header, string $secret): bool
    {
        if ($header === '') {
            return false;
        }

        $timestamp = null;
        $signatures = [];

        foreach (explode(',', $header) as $part) {
            [$key, $value] = array_pad(explode('=', trim($part), 2), 2, null);
            if ($key === 't') {
                $timestamp = $value;
            }
            if ($key === 'v1' && $value) {
                $signatures[] = $value;
            }
        }

        if ($timestamp === null || $signatures === []) {
            return false;
        }

        if (abs(time() - (int) $timestamp) > 300) {
            return false;
        }

        $signed = hash_hmac('sha256', $timestamp.'.'.$payload, $secret);

        foreach ($signatures as $signature) {
            if (hash_equals($signed, $signature)) {
                return true;
            }
        }

        return false;
    }
}
