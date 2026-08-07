<?php

namespace App\Core\Http\Middleware;

use App\Core\Support\ApiResponse;
use App\Core\Support\TenantContext;
use Closure;
use Illuminate\Http\Request;
use Modules\ModuleRegistry\Application\Services\ModuleRegistryService;
use Symfony\Component\HttpFoundation\Response;

final class EnsureModuleEnabled
{
    public function __construct(
        private readonly ModuleRegistryService $moduleRegistryService
    ) {}

    public function handle(Request $request, Closure $next, string $module): Response
    {
        $companyId = TenantContext::id();

        if (! $this->moduleRegistryService->isEnabled($module, $companyId)) {
            return ApiResponse::error(
                __('api.module.disabled', ['module' => $module]),
                403,
                code: 'MODULE_DISABLED'
            );
        }

        return $next($request);
    }
}
