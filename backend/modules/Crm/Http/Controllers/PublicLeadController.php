<?php

namespace Modules\Crm\Http\Controllers;

use App\Core\Support\ApiResponse;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Crm\Application\Services\LeadService;
use Modules\Crm\Http\Resources\LeadResource;

class PublicLeadController extends Controller
{
    public function __construct(
        private readonly LeadService $leadService
    ) {}

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:50'],
            'subject' => ['nullable', 'string', 'max:255'],
            'message' => ['required', 'string', 'max:5000'],
        ]);

        $lead = $this->leadService->createPublic($data);

        return ApiResponse::created(new LeadResource($lead), __('api.crm.lead_created'));
    }
}
