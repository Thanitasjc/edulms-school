<?php

namespace Modules\Auth\Application\Services;

use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Modules\Company\Domain\Models\Company;
use Spatie\Permission\Models\Role;
use Throwable;

class AuthService
{
    /**
     * @return array{user: User, token: string}
     *
     * @throws ValidationException
     */
    public function login(string $email, string $password, string $deviceName = 'web'): array
    {
        /** @var User|null $user */
        $user = User::query()->where('email', $email)->first();

        if ($user === null || ! Hash::check($password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => [__('api.auth.invalid_credentials')],
            ]);
        }

        if ($user->status !== 'active') {
            throw ValidationException::withMessages([
                'email' => [__('api.auth.inactive_account')],
            ]);
        }

        $token = $user->createToken($deviceName)->plainTextToken;
        $user->load(['companies', 'currentCompany', 'roles', 'permissions']);

        return [
            'user' => $user,
            'token' => $token,
        ];
    }

    /**
     * Public signup always creates a student on the public school.
     *
     * @param  array{name: string, email: string, password: string, phone?: string|null}  $data
     * @return array{user: User, token: string}
     *
     * @throws Throwable
     */
    public function register(array $data): array
    {
        return DB::transaction(function () use ($data): array {
            $company = $this->resolvePublicCompany();

            /** @var User $user */
            $user = User::query()->create([
                'name' => $data['name'],
                'email' => $data['email'],
                'phone' => $data['phone'] ?? null,
                'password' => $data['password'],
                'status' => 'active',
                'current_company_id' => $company->id,
            ]);

            $user->companies()->attach($company->id, ['is_default' => true]);

            $role = Role::findOrCreate('student', 'web');
            $user->syncRoles([$role]);

            $token = $user->createToken('web')->plainTextToken;
            $user->load(['companies', 'currentCompany', 'roles', 'permissions']);

            return [
                'user' => $user,
                'token' => $token,
            ];
        });
    }

    private function resolvePublicCompany(): Company
    {
        $slug = (string) config('tenancy.public_company_slug', 'demo-academy');

        /** @var Company|null $company */
        $company = Company::query()
            ->where('slug', $slug)
            ->where('status', 'active')
            ->first();

        if ($company === null) {
            $company = Company::query()
                ->where('status', 'active')
                ->orderBy('id')
                ->first();
        }

        if ($company === null) {
            throw ValidationException::withMessages([
                'email' => [__('api.auth.public_school_unavailable')],
            ]);
        }

        return $company;
    }

    public function logout(User $user): void
    {
        $user->currentAccessToken()?->delete();
    }

    public function logoutAll(User $user): void
    {
        $user->tokens()->delete();
    }
}
