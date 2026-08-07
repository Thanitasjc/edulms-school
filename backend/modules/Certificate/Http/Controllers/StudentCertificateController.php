<?php

namespace Modules\Certificate\Http\Controllers;

use App\Core\Support\ApiResponse;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Certificate\Application\Services\CertificateService;
use Modules\Certificate\Http\Resources\CertificateResource;

class StudentCertificateController extends Controller
{
    public function __construct(
        private readonly CertificateService $certificateService
    ) {}

    public function mine(Request $request): JsonResponse
    {
        return ApiResponse::success(
            CertificateResource::collection($this->certificateService->listMine($request->user())),
            __('api.certificate.retrieved_list')
        );
    }

    public function showByCode(string $code): JsonResponse
    {
        return ApiResponse::success(
            new CertificateResource($this->certificateService->findByCode($code)),
            __('api.certificate.retrieved')
        );
    }
}
