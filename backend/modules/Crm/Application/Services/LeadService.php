<?php

namespace Modules\Crm\Application\Services;

use App\Core\Support\QueryFilter;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Modules\Company\Domain\Models\Company;
use Modules\Crm\Domain\Models\Lead;
use Throwable;

class LeadService
{
    /**
     * @throws Throwable
     */
    public function createPublic(array $data): Lead
    {
        return DB::transaction(function () use ($data): Lead {
            $company = Company::query()->where('slug', 'demo-academy')->first()
                ?? Company::query()->first();

            $data['company_id'] = $company?->id;
            $data['status'] = $data['status'] ?? 'new';
            $data['source'] = $data['source'] ?? 'contact';

            /** @var Lead $lead */
            $lead = Lead::query()
                ->withoutGlobalScope('company')
                ->create($data);

            return $lead;
        });
    }

    public function listAdmin(QueryFilter $queryFilter): LengthAwarePaginator
    {
        $query = Lead::query();

        $queryFilter->apply(
            $query,
            searchable: ['name', 'email', 'phone', 'subject', 'message'],
            filterable: ['status', 'source'],
            sortable: ['id', 'name', 'email', 'status', 'created_at', 'updated_at']
        );

        return $query->paginate($queryFilter->perPage());
    }

    public function findAdmin(int $id): Lead
    {
        /** @var Lead $lead */
        $lead = Lead::query()->findOrFail($id);

        return $lead;
    }

    /**
     * @throws Throwable
     */
    public function updateStatus(int $id, string $status): Lead
    {
        return DB::transaction(function () use ($id, $status): Lead {
            $lead = $this->findAdmin($id);
            $lead->update(['status' => $status]);

            return $lead->refresh();
        });
    }

    /**
     * @throws Throwable
     */
    public function delete(int $id): bool
    {
        return DB::transaction(function () use ($id): bool {
            return (bool) $this->findAdmin($id)->delete();
        });
    }
}
