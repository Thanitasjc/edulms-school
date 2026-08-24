<?php

use Illuminate\Database\Migrations\Migration;
use Modules\Company\Domain\Models\Company;
use Modules\ModuleRegistry\Application\Services\ModuleRegistryService;
use Modules\ModuleRegistry\Domain\Models\Module;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

return new class extends Migration
{
    public function up(): void
    {
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        $permission = Permission::findOrCreate('payment.view', 'web');

        foreach (['super_admin', 'company_admin'] as $roleName) {
            $role = Role::findOrCreate($roleName, 'web');
            if (! $role->hasPermissionTo($permission)) {
                $role->givePermissionTo($permission);
            }
        }

        /** @var ModuleRegistryService $moduleRegistry */
        $moduleRegistry = app(ModuleRegistryService::class);
        $moduleRegistry->syncFromConfig();

        $paymentModule = Module::query()->where('key', 'payment')->first();
        if ($paymentModule) {
            foreach (Company::query()->pluck('id') as $companyId) {
                $paymentModule->companies()->syncWithoutDetaching([
                    (int) $companyId => ['is_enabled' => true],
                ]);
            }
        }
    }

    public function down(): void
    {
        // Keep permission and module bindings.
    }
};
