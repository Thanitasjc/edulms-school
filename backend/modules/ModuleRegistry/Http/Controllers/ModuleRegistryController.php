<?php

namespace Modules\ModuleRegistry\Http\Controllers;

use App\Core\Support\ApiResponse;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\ModuleRegistry\Application\Services\ModuleRegistryService;
use Modules\ModuleRegistry\Http\Resources\ModuleResource;

class ModuleRegistryController extends Controller
{
    public function __construct(
        private readonly ModuleRegistryService $moduleRegistryService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $modules = $this->moduleRegistryService->all();

        return ApiResponse::success(
            ModuleResource::collection($modules),
            __('api.module.retrieved'),
            meta: [
                'enabled' => $this->moduleRegistryService->enabledKeysForCompany(
                    $request->user()?->current_company_id ? (int) $request->user()->current_company_id : null
                ),
            ]
        );
    }

    public function bootstrap(Request $request): JsonResponse
    {
        $user = $request->user();
        $companyId = $user?->current_company_id ? (int) $user->current_company_id : null;

        return ApiResponse::success([
            'enabled_modules' => $this->moduleRegistryService->enabledKeysForCompany($companyId),
            'modules' => ModuleResource::collection($this->moduleRegistryService->all()),
            'permissions' => $user ? $user->getAllPermissions()->pluck('name')->values() : [],
            'roles' => $user ? $user->getRoleNames() : [],
        ], __('api.module.bootstrap_retrieved'));
    }
}
