<?php

namespace App\Core\Http\Middleware;

use App\Core\Support\ApiResponse;
use App\Core\Support\TenantContext;
use Closure;
use Illuminate\Http\Request;
use Modules\Company\Domain\Models\Company;
use Symfony\Component\HttpFoundation\Response;

final class ResolveTenant
{
    public function handle(Request $request, Closure $next): Response
    {
        TenantContext::clear();

        $user = $request->user();
        $requestedCompanyId = $request->header('X-Company-Id') ?? $request->query('company_id');

        if ($user === null) {
            return $next($request);
        }

        if ($user->is_super_admin) {
            if ($requestedCompanyId) {
                $company = Company::query()->find((int) $requestedCompanyId);

                if ($company === null) {
                    return ApiResponse::error(__('api.tenant.company_not_found'), 404, code: 'COMPANY_NOT_FOUND');
                }

                TenantContext::set($company->id);
            } else {
                TenantContext::bypass();
            }

            return $next($request);
        }

        $companyId = $requestedCompanyId
            ? (int) $requestedCompanyId
            : ($user->current_company_id ? (int) $user->current_company_id : null);

        if ($companyId === null) {
            $companyId = $user->companies()->value('companies.id');
        }

        if ($companyId === null) {
            return ApiResponse::error(__('api.tenant.required'), 403, code: 'TENANT_REQUIRED');
        }

        $belongs = $user->companies()->where('companies.id', $companyId)->exists();

        if (! $belongs) {
            return ApiResponse::error(__('api.tenant.forbidden'), 403, code: 'TENANT_FORBIDDEN');
        }

        TenantContext::set($companyId);

        if ((int) $user->current_company_id !== $companyId) {
            $user->forceFill(['current_company_id' => $companyId])->save();
        }

        return $next($request);
    }
}
