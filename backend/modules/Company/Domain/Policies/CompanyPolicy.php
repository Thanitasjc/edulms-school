<?php

namespace Modules\Company\Domain\Policies;

use App\Models\User;
use Modules\Company\Domain\Models\Company;

class CompanyPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->is_super_admin || $user->can('company.view');
    }

    public function view(User $user, Company $company): bool
    {
        if ($user->is_super_admin || $user->can('company.view')) {
            return true;
        }

        return $user->companies()->where('companies.id', $company->id)->exists();
    }

    public function create(User $user): bool
    {
        return $user->is_super_admin || $user->can('company.create');
    }

    public function update(User $user, Company $company): bool
    {
        return $user->is_super_admin || $user->can('company.update');
    }

    public function delete(User $user, Company $company): bool
    {
        return $user->is_super_admin || $user->can('company.delete');
    }

    public function restore(User $user, Company $company): bool
    {
        return $user->is_super_admin || $user->can('company.restore');
    }

    public function forceDelete(User $user, Company $company): bool
    {
        return $user->is_super_admin || $user->can('company.force_delete');
    }
}
