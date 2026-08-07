<?php

namespace Modules\Media\Database\Seeders;

use Illuminate\Database\Seeder;
use Modules\Company\Domain\Models\Company;
use Modules\ModuleRegistry\Application\Services\ModuleRegistryService;
use Modules\ModuleRegistry\Domain\Models\Module;

class MediaSeeder extends Seeder
{
    public function run(): void
    {
        app(ModuleRegistryService::class)->syncFromConfig();

        $company = Company::query()->where('slug', 'demo-academy')->first()
            ?? Company::query()->first();

        if ($company === null) {
            return;
        }

        $module = Module::query()->where('key', 'media')->first();
        if ($module) {
            $module->update(['is_enabled' => true]);
            $module->companies()->syncWithoutDetaching([
                $company->id => ['is_enabled' => true],
            ]);
        }
    }
}
