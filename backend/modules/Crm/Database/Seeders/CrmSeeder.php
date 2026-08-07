<?php

namespace Modules\Crm\Database\Seeders;

use Illuminate\Database\Seeder;
use Modules\Company\Domain\Models\Company;
use Modules\Crm\Domain\Models\Lead;
use Modules\ModuleRegistry\Application\Services\ModuleRegistryService;
use Modules\ModuleRegistry\Domain\Models\Module;

class CrmSeeder extends Seeder
{
    public function run(): void
    {
        app(ModuleRegistryService::class)->syncFromConfig();

        $company = Company::query()->where('slug', 'demo-academy')->first()
            ?? Company::query()->first();

        if ($company === null) {
            return;
        }

        $module = Module::query()->where('key', 'crm')->first();
        if ($module) {
            $module->update(['is_enabled' => true]);
            $module->companies()->syncWithoutDetaching([
                $company->id => ['is_enabled' => true],
            ]);
        }

        Lead::withoutGlobalScope('company')->updateOrCreate(
            ['company_id' => $company->id, 'email' => 'prospect@example.com'],
            [
                'name' => 'Sample Prospect',
                'phone' => '+66812345678',
                'subject' => 'Course inquiry',
                'message' => 'I would like to learn more about your online programs.',
                'status' => 'new',
                'source' => 'contact',
            ]
        );
    }
}
