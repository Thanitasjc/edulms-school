<?php

namespace Modules\User\Application\Services;

use App\Core\Support\QueryFilter;
use App\Core\Support\TenantContext;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\DB;
use Throwable;

class UserService
{
    public function list(QueryFilter $queryFilter): LengthAwarePaginator
    {
        $query = User::query()->with(['roles', 'companies']);
        $this->constrainToTenant($query);

        $queryFilter->apply(
            $query,
            searchable: ['name', 'email', 'phone'],
            filterable: ['status'],
            sortable: ['id', 'name', 'email', 'status', 'created_at', 'updated_at']
        );

        return $query->paginate($queryFilter->perPage());
    }

    /**
     * @throws Throwable
     */
    public function create(array $data): User
    {
        return DB::transaction(function () use ($data): User {
            $roles = $data['roles'] ?? [];
            $companyIds = $this->tenantCompanyIds($data['company_ids'] ?? []);
            unset($data['roles'], $data['company_ids'], $data['password_confirmation']);

            if (empty($data['current_company_id']) && $companyIds !== []) {
                $data['current_company_id'] = $companyIds[0];
            }

            /** @var User $user */
            $user = User::query()->create($data);

            if ($roles !== []) {
                $user->syncRoles($roles);
            }

            if ($companyIds !== []) {
                $user->companies()->sync($companyIds);
                if (empty($user->current_company_id)) {
                    $user->forceFill(['current_company_id' => $companyIds[0]])->save();
                }
            }

            return $user->load(['roles', 'companies']);
        });
    }

    /**
     * @throws Throwable
     */
    public function update(User $user, array $data): User
    {
        return DB::transaction(function () use ($user, $data): User {
            $roles = $data['roles'] ?? null;
            $companyIds = array_key_exists('company_ids', $data)
                ? $this->tenantCompanyIds($data['company_ids'] ?? [])
                : null;
            unset($data['roles'], $data['company_ids'], $data['password_confirmation']);

            if (array_key_exists('password', $data) && ($data['password'] === null || $data['password'] === '')) {
                unset($data['password']);
            }

            $user->update($data);

            if (is_array($roles)) {
                $user->syncRoles($roles);
            }

            if (is_array($companyIds)) {
                $user->companies()->sync($companyIds);
            }

            return $user->refresh()->load(['roles', 'companies']);
        });
    }

    public function delete(User $user): bool
    {
        return (bool) $user->delete();
    }

    public function restore(int $id): User
    {
        /** @var User $user */
        $user = User::onlyTrashed()->findOrFail($id);
        $user->restore();

        return $user->refresh()->load(['roles', 'companies']);
    }

    private function constrainToTenant(Builder $query): void
    {
        $companyId = TenantContext::id();

        if ($companyId === null || TenantContext::bypassed()) {
            return;
        }

        $query->where(function (Builder $builder) use ($companyId): void {
            $builder
                ->where('current_company_id', $companyId)
                ->orWhereHas('companies', function (Builder $companies) use ($companyId): void {
                    $companies->where('companies.id', $companyId);
                });
        });
    }

    /**
     * @param  array<int, mixed>  $companyIds
     * @return array<int, int>
     */
    private function tenantCompanyIds(array $companyIds): array
    {
        $ids = array_values(array_unique(array_map('intval', $companyIds)));
        $tenantId = TenantContext::id();

        if ($tenantId === null || TenantContext::bypassed()) {
            return $ids;
        }

        $ids = array_values(array_filter($ids, fn (int $id): bool => $id === $tenantId));

        return $ids !== [] ? $ids : [$tenantId];
    }
}
