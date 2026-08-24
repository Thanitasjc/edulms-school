<?php

namespace Modules\Enrollment\Http\Controllers;

use App\Core\Support\ApiResponse;
use App\Core\Support\QueryFilter;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Enrollment\Application\Services\EnrollmentService;
use Modules\Enrollment\Domain\Models\Enrollment;
use Modules\Enrollment\Http\Requests\CheckoutEnrollmentRequest;
use Modules\Enrollment\Http\Requests\PurchaseEnrollmentRequest;
use Modules\Enrollment\Http\Resources\EnrollmentResource;
use Modules\Payment\Application\Services\PaymentService;
use Modules\Payment\Http\Resources\PaymentResource;

class EnrollmentController extends Controller
{
    public function __construct(
        private readonly EnrollmentService $enrollmentService,
        private readonly PaymentService $paymentService,
    ) {}

    public function index(Request $request): JsonResponse
    {
        abort_unless($request->user()?->can('enrollment.view') || $request->user()?->is_super_admin, 403);

        $paginator = $this->enrollmentService->listAdmin(new QueryFilter($request));

        return ApiResponse::success(
            EnrollmentResource::collection($paginator),
            __('api.enrollment.retrieved_list')
        );
    }

    public function mine(Request $request): JsonResponse
    {
        $paginator = $this->enrollmentService->listMine($request->user(), new QueryFilter($request));

        return ApiResponse::success(
            EnrollmentResource::collection($paginator),
            __('api.enrollment.retrieved_list')
        );
    }

    public function purchase(PurchaseEnrollmentRequest $request): JsonResponse
    {
        $result = $this->paymentService->checkout(
            $request->user(),
            [(int) $request->validated('course_id')]
        );

        if ($result['mode'] === 'payment_required') {
            return ApiResponse::created(
                [
                    'mode' => 'payment_required',
                    'checkout_url' => $result['checkout_url'],
                    'payment' => $result['payment'] ? new PaymentResource($result['payment']) : null,
                    'enrollment' => null,
                ],
                __('api.payment.checkout_created')
            );
        }

        $enrollment = $result['enrollments'][0] ?? null;

        return ApiResponse::created(
            [
                'mode' => 'enrolled',
                'checkout_url' => null,
                'payment' => null,
                'enrollment' => $enrollment ? new EnrollmentResource($enrollment) : null,
            ],
            __('api.enrollment.purchased')
        );
    }

    public function checkout(CheckoutEnrollmentRequest $request): JsonResponse
    {
        $result = $this->paymentService->checkout(
            $request->user(),
            $request->validated('course_ids')
        );

        return ApiResponse::created(
            [
                'mode' => $result['mode'],
                'checkout_url' => $result['checkout_url'],
                'payment' => $result['payment'] ? new PaymentResource($result['payment']) : null,
                'enrollments' => EnrollmentResource::collection(collect($result['enrollments'])),
                'skipped_course_ids' => $result['skipped_course_ids'],
                'purchased_count' => $result['purchased_count'],
            ],
            $result['mode'] === 'payment_required'
                ? __('api.payment.checkout_created')
                : __('api.enrollment.checkout_completed')
        );
    }

    public function show(Request $request, Enrollment $enrollment): JsonResponse
    {
        abort_unless($request->user()?->can('enrollment.view') || $request->user()?->is_super_admin, 403);

        return ApiResponse::success(
            new EnrollmentResource($enrollment->load(['course', 'user'])),
            __('api.enrollment.retrieved')
        );
    }

    public function cancel(Request $request, Enrollment $enrollment): JsonResponse
    {
        abort_unless($request->user()?->can('enrollment.update') || $request->user()?->is_super_admin, 403);

        $enrollment = $this->enrollmentService->cancel($enrollment->id);

        return ApiResponse::success(
            new EnrollmentResource($enrollment),
            __('api.enrollment.cancelled')
        );
    }
}
