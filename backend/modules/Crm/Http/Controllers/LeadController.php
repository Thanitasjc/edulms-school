<?php

namespace Modules\Crm\Http\Controllers;

use App\Core\Support\ApiResponse;
use App\Core\Support\QueryFilter;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Modules\Crm\Application\Services\LeadService;
use Modules\Crm\Domain\Models\Lead;
use Modules\Crm\Http\Resources\LeadResource;

class LeadController extends Controller
{
    public function __construct(
        private readonly LeadService $leadService
    ) {}

    public function index(Request $request): JsonResponse
    {
        abort_unless($request->user()?->can('crm.view') || $request->user()?->is_super_admin, 403);

        return ApiResponse::success(
            LeadResource::collection($this->leadService->listAdmin(new QueryFilter($request))),
            __('api.crm.retrieved_list')
        );
    }

    public function show(Request $request, Lead $lead): JsonResponse
    {
        abort_unless($request->user()?->can('crm.view') || $request->user()?->is_super_admin, 403);

        return ApiResponse::success(new LeadResource($lead), __('api.crm.retrieved'));
    }

    public function updateStatus(Request $request, Lead $lead): JsonResponse
    {
        abort_unless($request->user()?->can('crm.update') || $request->user()?->is_super_admin, 403);

        $data = $request->validate([
            'status' => ['required', 'string', Rule::in(['new', 'contacted', 'qualified', 'closed', 'spam'])],
        ]);

        $lead = $this->leadService->updateStatus($lead->id, $data['status']);

        return ApiResponse::success(new LeadResource($lead), __('api.crm.updated'));
    }

    public function destroy(Request $request, Lead $lead): JsonResponse
    {
        abort_unless($request->user()?->can('crm.delete') || $request->user()?->is_super_admin, 403);

        $this->leadService->delete($lead->id);

        return ApiResponse::noContent(__('api.crm.deleted'));
    }
}
