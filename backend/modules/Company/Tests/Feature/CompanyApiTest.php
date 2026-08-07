<?php

namespace Modules\Company\Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Modules\Company\Domain\Models\Company;
use Modules\ModuleRegistry\Application\Services\ModuleRegistryService;
use Spatie\Permission\Models\Permission;
use Tests\TestCase;

class CompanyApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        foreach ([
            'company.view', 'company.create', 'company.update', 'company.delete', 'company.restore',
        ] as $permission) {
            Permission::findOrCreate($permission, 'web');
        }

        app(ModuleRegistryService::class)->syncFromConfig();
    }

    public function test_super_admin_can_list_companies(): void
    {
        $company = Company::query()->create([
            'name' => 'Listed Co',
            'slug' => 'listed-co',
            'status' => 'active',
        ]);

        app(ModuleRegistryService::class)->enableCoreModulesForCompany((int) $company->id);

        $user = User::query()->create([
            'name' => 'Super',
            'email' => 'super@lms.test',
            'password' => 'Password123!',
            'status' => 'active',
            'is_super_admin' => true,
            'current_company_id' => $company->id,
        ]);
        $user->companies()->attach($company->id, ['is_default' => true]);
        $user->givePermissionTo('company.view');

        $response = $this->actingAs($user, 'sanctum')
            ->withHeader('X-Company-Id', (string) $company->id)
            ->getJson('/api/v1/companies');

        $response->assertOk()->assertJsonPath('success', true);
    }
}
