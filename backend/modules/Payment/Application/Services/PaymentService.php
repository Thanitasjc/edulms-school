<?php

namespace Modules\Payment\Application\Services;

use App\Models\User;
use Illuminate\Support\Facades\DB;
use Modules\Course\Domain\Models\Course;
use Modules\Enrollment\Application\Services\EnrollmentService;
use Modules\Payment\Application\Contracts\PaymentGateway;
use Modules\Payment\Domain\Models\Payment;
use Modules\Payment\Infrastructure\Gateways\DemoPaymentGateway;
use Modules\Payment\Infrastructure\Gateways\StripePaymentGateway;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;
use Symfony\Component\HttpKernel\Exception\ConflictHttpException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Throwable;

class PaymentService
{
    public function __construct(
        private readonly EnrollmentService $enrollmentService,
    ) {}

    public function resolveGateway(): PaymentGateway
    {
        $driver = (string) config('payment.driver', 'stripe');
        $stripeSecret = (string) config('payment.stripe.secret');

        if ($driver === 'stripe' && $stripeSecret !== '') {
            return new StripePaymentGateway;
        }

        return new DemoPaymentGateway;
    }

    /**
     * Start checkout: enroll free courses immediately; create payment for paid ones.
     *
     * @param  list<int>  $courseIds
     * @return array<string, mixed>
     *
     * @throws Throwable
     */
    public function checkout(User $user, array $courseIds): array
    {
        $courseIds = array_values(array_unique(array_map('intval', $courseIds)));
        if ($courseIds === []) {
            throw new BadRequestHttpException(__('api.payment.empty_cart'));
        }

        $courses = Course::query()
            ->withoutGlobalScope('company')
            ->published()
            ->whereIn('id', $courseIds)
            ->get()
            ->keyBy('id');

        if ($courses->count() !== count($courseIds)) {
            throw new NotFoundHttpException(__('api.enrollment.course_not_found'));
        }

        $freeIds = [];
        $paidItems = [];
        $skipped = [];
        $companyId = null;

        foreach ($courseIds as $courseId) {
            /** @var Course $course */
            $course = $courses->get($courseId);

            if ($this->enrollmentService->isUserEnrolled($user, $courseId)) {
                $skipped[] = $courseId;
                continue;
            }

            $amount = $this->resolvePrice($course);
            $companyId ??= $course->company_id;

            if ($amount <= 0) {
                $freeIds[] = $courseId;
            } else {
                $paidItems[] = [
                    'course' => $course,
                    'amount' => $amount,
                ];
            }
        }

        $enrollments = [];
        if ($freeIds !== []) {
            $freeResult = $this->enrollmentService->purchaseMany($user, $freeIds);
            $enrollments = $freeResult['enrollments'];
            $skipped = array_values(array_unique(array_merge($skipped, $freeResult['skipped_course_ids'])));
        }

        if ($paidItems === []) {
            return [
                'mode' => 'enrolled',
                'payment' => null,
                'checkout_url' => null,
                'enrollments' => $enrollments,
                'skipped_course_ids' => $skipped,
                'purchased_count' => count($enrollments),
            ];
        }

        $gateway = $this->resolveGateway();
        $currency = strtoupper((string) config('payment.currency', 'thb'));
        $total = array_sum(array_map(fn (array $item): float => $item['amount'], $paidItems));

        $frontend = rtrim((string) config('payment.frontend_url'), '/');

        $payment = DB::transaction(function () use ($user, $companyId, $gateway, $currency, $total, $paidItems, $frontend): Payment {
            /** @var Payment $payment */
            $payment = Payment::query()->create([
                'company_id' => $companyId,
                'user_id' => $user->id,
                'status' => 'pending',
                'gateway' => $gateway->name(),
                'amount' => $total,
                'currency' => $currency,
            ]);

            foreach ($paidItems as $item) {
                /** @var Course $course */
                $course = $item['course'];
                $payment->items()->create([
                    'course_id' => $course->id,
                    'title' => $course->title,
                    'amount' => $item['amount'],
                ]);
            }

            $successUrl = $frontend.'/checkout/success?payment='.$payment->uuid;
            $cancelUrl = $frontend.'/checkout?cancelled=1';

            $session = $gateway->createCheckoutSession($payment->fresh(['items']), $successUrl, $cancelUrl);

            $payment->update([
                'external_id' => $session['external_id'] ?? null,
                'checkout_url' => $session['checkout_url'] ?? null,
                'meta' => array_merge($payment->meta ?? [], $session['meta'] ?? []),
                'status' => 'requires_action',
            ]);

            return $payment->fresh(['items.course']);
        });

        return [
            'mode' => 'payment_required',
            'payment' => $payment,
            'checkout_url' => $payment->checkout_url,
            'enrollments' => $enrollments,
            'skipped_course_ids' => $skipped,
            'purchased_count' => count($enrollments),
        ];
    }

    public function findByUuidForUser(string $uuid, User $user): Payment
    {
        /** @var Payment $payment */
        $payment = Payment::query()
            ->withoutGlobalScope('company')
            ->with(['items.course'])
            ->where('uuid', $uuid)
            ->where('user_id', $user->id)
            ->firstOrFail();

        return $payment;
    }

    public function findByUuid(string $uuid): Payment
    {
        /** @var Payment $payment */
        $payment = Payment::query()
            ->withoutGlobalScope('company')
            ->with(['items.course'])
            ->where('uuid', $uuid)
            ->firstOrFail();

        return $payment;
    }

    /**
     * Confirm a demo payment (only for demo gateway).
     *
     * @throws Throwable
     */
    public function confirmDemo(Payment $payment, User $user): Payment
    {
        if ((int) $payment->user_id !== (int) $user->id) {
            throw new NotFoundHttpException(__('api.not_found'));
        }

        if ($payment->gateway !== 'demo') {
            throw new BadRequestHttpException(__('api.payment.demo_only'));
        }

        if ($payment->isPaid()) {
            return $payment;
        }

        return $this->markPaidAndEnroll($payment);
    }

    /**
     * Sync payment status from the gateway (Stripe return URL backup).
     *
     * @throws Throwable
     */
    public function sync(Payment $payment, User $user): Payment
    {
        if ((int) $payment->user_id !== (int) $user->id) {
            throw new NotFoundHttpException(__('api.not_found'));
        }

        if ($payment->isPaid()) {
            return $payment;
        }

        $gateway = $payment->gateway === 'stripe'
            ? new StripePaymentGateway
            : new DemoPaymentGateway;

        if (! $gateway->isSessionPaid($payment)) {
            return $payment;
        }

        return $this->markPaidAndEnroll($payment);
    }

    /**
     * Complete payment from Stripe webhook.
     *
     * @throws Throwable
     */
    public function completeFromExternalId(string $externalId): ?Payment
    {
        /** @var Payment|null $payment */
        $payment = Payment::query()
            ->withoutGlobalScope('company')
            ->with(['items'])
            ->where('external_id', $externalId)
            ->first();

        if ($payment === null) {
            return null;
        }

        if ($payment->isPaid()) {
            return $payment;
        }

        return $this->markPaidAndEnroll($payment);
    }

    /**
     * @throws Throwable
     */
    public function markPaidAndEnroll(Payment $payment): Payment
    {
        return DB::transaction(function () use ($payment): Payment {
            $locked = Payment::query()
                ->withoutGlobalScope('company')
                ->with(['items'])
                ->whereKey($payment->id)
                ->lockForUpdate()
                ->firstOrFail();

            if ($locked->isPaid()) {
                return $locked;
            }

            $user = User::query()->findOrFail($locked->user_id);
            $courseIds = $locked->items->pluck('course_id')->map(fn ($id) => (int) $id)->all();

            foreach ($courseIds as $courseId) {
                try {
                    $this->enrollmentService->purchase($user, $courseId);
                } catch (ConflictHttpException) {
                    // Already enrolled — treat as success for this line item.
                }
            }

            $locked->update([
                'status' => 'paid',
                'paid_at' => now(),
            ]);

            return $locked->fresh(['items.course']);
        });
    }

    private function resolvePrice(Course $course): float
    {
        if ($course->is_free || (float) $course->price <= 0) {
            return 0.0;
        }

        if ($course->sale_price !== null && (float) $course->sale_price >= 0) {
            return (float) $course->sale_price;
        }

        return (float) $course->price;
    }
}
