<?php

namespace Modules\Auth\Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Modules\Company\Domain\Models\Company;
use Modules\ModuleRegistry\Application\Services\ModuleRegistryService;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class AuthApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        foreach (['company.view', 'user.view', 'role.view', 'permission.view', 'setting.view'] as $permission) {
            Permission::findOrCreate($permission, 'web');
        }

        Role::findOrCreate('student', 'web');
        app(ModuleRegistryService::class)->syncFromConfig();
        Company::query()->create([
            'name' => 'Demo Academy',
            'slug' => 'demo-academy',
            'status' => 'active',
        ]);
    }

    public function test_user_can_register_and_receive_token(): void
    {
        $response = $this->postJson('/api/v1/auth/register', [
            'name' => 'Learner One',
            'email' => 'learner@academy.test',
            'password' => 'Password123!',
            'password_confirmation' => 'Password123!',
        ]);

        $response->assertCreated()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.user.roles.0', 'student')
            ->assertJsonStructure([
                'data' => [
                    'token',
                    'token_type',
                    'user' => ['id', 'email', 'name'],
                    'enabled_modules',
                ],
            ]);

        $this->assertDatabaseHas('users', ['email' => 'learner@academy.test']);
    }

    public function test_user_can_login_with_valid_credentials(): void
    {
        $company = Company::query()->create([
            'name' => 'Login Co',
            'slug' => 'login-co',
            'status' => 'active',
        ]);

        $user = User::query()->create([
            'name' => 'Login User',
            'email' => 'login@academy.test',
            'password' => 'Password123!',
            'status' => 'active',
            'current_company_id' => $company->id,
        ]);
        $user->companies()->attach($company->id, ['is_default' => true]);

        $response = $this->postJson('/api/v1/auth/login', [
            'email' => 'login@academy.test',
            'password' => 'Password123!',
            'device_name' => 'phpunit',
        ]);

        $response->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.user.email', 'login@academy.test');
    }

    public function test_authenticated_user_can_fetch_profile(): void
    {
        $company = Company::query()->create([
            'name' => 'Profile Co',
            'slug' => 'profile-co',
            'status' => 'active',
        ]);

        $user = User::query()->create([
            'name' => 'Profile User',
            'email' => 'profile@academy.test',
            'password' => 'Password123!',
            'status' => 'active',
            'current_company_id' => $company->id,
        ]);
        $user->companies()->attach($company->id, ['is_default' => true]);

        $response = $this->actingAs($user, 'sanctum')
            ->withHeader('X-Company-Id', (string) $company->id)
            ->getJson('/api/v1/auth/me');

        $response->assertOk()
            ->assertJsonPath('data.user.email', 'profile@academy.test');
    }
}
