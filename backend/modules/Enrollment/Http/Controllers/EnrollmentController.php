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

class EnrollmentController extends Controller
{
    public function __construct(
        private readonly EnrollmentService $enrollmentService
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
        $enrollment = $this->enrollmentService->purchase(
            $request->user(),
            (int) $request->validated('course_id')
        );

        return ApiResponse::created(
            new EnrollmentResource($enrollment),
            __('api.enrollment.purchased')
        );
    }

    public function checkout(CheckoutEnrollmentRequest $request): JsonResponse
    {
        $result = $this->enrollmentService->purchaseMany(
            $request->user(),
            $request->validated('course_ids')
        );

        return ApiResponse::created(
            [
                'enrollments' => EnrollmentResource::collection(collect($result['enrollments'])),
                'skipped_course_ids' => $result['skipped_course_ids'],
                'purchased_count' => $result['purchased_count'],
            ],
            __('api.enrollment.checkout_completed')
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
