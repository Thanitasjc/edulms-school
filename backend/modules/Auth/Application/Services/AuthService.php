<?php

namespace Modules\Auth\Application\Services;

use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Modules\Company\Application\Services\CompanyService;
use Modules\ModuleRegistry\Application\Services\ModuleRegistryService;
use Spatie\Permission\Models\Role;
use Throwable;

class AuthService
{
    public function __construct(
        private readonly CompanyService $companyService,
        private readonly ModuleRegistryService $moduleRegistryService
    ) {}

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
     * @return array{user: User, token: string}
     *
     * @throws Throwable
     */
    public function register(array $data): array
    {
        return DB::transaction(function () use ($data): array {
            $company = $this->companyService->create([
                'name' => $data['company_name'],
                'email' => $data['email'],
                'status' => 'active',
                'timezone' => config('app.timezone', 'Asia/Bangkok'),
                'locale' => 'th',
            ]);

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

            $this->moduleRegistryService->enableCoreModulesForCompany((int) $company->id);

            $role = Role::findOrCreate('company_admin', 'web');
            $user->assignRole($role);

            $token = $user->createToken('web')->plainTextToken;
            $user->load(['companies', 'currentCompany', 'roles', 'permissions']);

            return [
                'user' => $user,
                'token' => $token,
            ];
        });
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
