<?php

namespace Modules\Certificate\Http\Controllers;

use App\Core\Support\ApiResponse;
use App\Core\Support\QueryFilter;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Certificate\Application\Services\CertificateService;
use Modules\Certificate\Domain\Models\Certificate;
use Modules\Certificate\Http\Resources\CertificateResource;

class CertificateController extends Controller
{
    public function __construct(
        private readonly CertificateService $certificateService
    ) {}

    public function index(Request $request): JsonResponse
    {
        abort_unless($request->user()?->can('certificate.view') || $request->user()?->is_super_admin, 403);

        return ApiResponse::success(
            CertificateResource::collection($this->certificateService->listAdmin(new QueryFilter($request))),
            __('api.certificate.retrieved_list')
        );
    }

    public function show(Request $request, Certificate $certificate): JsonResponse
    {
        abort_unless($request->user()?->can('certificate.view') || $request->user()?->is_super_admin, 403);

        return ApiResponse::success(
            new CertificateResource($this->certificateService->findAdmin($certificate->id)),
            __('api.certificate.retrieved')
        );
    }
}
