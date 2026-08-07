<?php

namespace Modules\Company\Http\Controllers;

use App\Core\Support\ApiResponse;
use App\Core\Support\QueryFilter;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Company\Application\Services\CompanyService;
use Modules\Company\Domain\Models\Company;
use Modules\Company\Http\Requests\StoreCompanyRequest;
use Modules\Company\Http\Requests\UpdateCompanyRequest;
use Modules\Company\Http\Resources\CompanyResource;

class CompanyController extends Controller
{
    public function __construct(
        private readonly CompanyService $companyService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', Company::class);

        $paginator = $this->companyService->list(new QueryFilter($request));

        return ApiResponse::success(
            CompanyResource::collection($paginator),
            __('api.company.retrieved_list')
        );
    }

    public function store(StoreCompanyRequest $request): JsonResponse
    {
        $this->authorize('create', Company::class);

        $company = $this->companyService->create($request->validated());

        return ApiResponse::created(
            new CompanyResource($company),
            __('api.company.created')
        );
    }

    public function show(Company $company): JsonResponse
    {
        $this->authorize('view', $company);

        return ApiResponse::success(
            new CompanyResource($company),
            __('api.company.retrieved')
        );
    }

    public function update(UpdateCompanyRequest $request, Company $company): JsonResponse
    {
        $this->authorize('update', $company);

        $company = $this->companyService->update($company->id, $request->validated());

        return ApiResponse::success(
            new CompanyResource($company),
            __('api.company.updated')
        );
    }

    public function destroy(Company $company): JsonResponse
    {
        $this->authorize('delete', $company);

        $this->companyService->delete($company->id);

        return ApiResponse::noContent(__('api.company.deleted'));
    }

    public function restore(int $company): JsonResponse
    {
        $restored = $this->companyService->restore($company);
        $this->authorize('restore', $restored);

        return ApiResponse::success(
            new CompanyResource($restored),
            __('api.company.restored')
        );
    }
}
