<?php

namespace Modules\User\Application\Services;

use App\Core\Support\QueryFilter;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Throwable;

class UserService
{
    public function list(QueryFilter $queryFilter): LengthAwarePaginator
    {
        $query = User::query()->with(['roles', 'companies']);

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
            $companyIds = $data['company_ids'] ?? [];
            unset($data['roles'], $data['company_ids'], $data['password_confirmation']);

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
            $companyIds = $data['company_ids'] ?? null;
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
}
