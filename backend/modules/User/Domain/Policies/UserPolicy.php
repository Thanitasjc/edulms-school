<?php

namespace Modules\User\Domain\Policies;

use App\Models\User;

class UserPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->is_super_admin || $user->can('user.view');
    }

    public function view(User $user, User $model): bool
    {
        return $user->is_super_admin || $user->can('user.view') || $user->id === $model->id;
    }

    public function create(User $user): bool
    {
        return $user->is_super_admin || $user->can('user.create');
    }

    public function update(User $user, User $model): bool
    {
        return $user->is_super_admin || $user->can('user.update') || $user->id === $model->id;
    }

    public function delete(User $user, User $model): bool
    {
        return ($user->is_super_admin || $user->can('user.delete')) && $user->id !== $model->id;
    }

    public function restore(User $user, User $model): bool
    {
        return $user->is_super_admin || $user->can('user.restore');
    }
}
