<?php

namespace Modules\Certificate\Database\Seeders;

use Illuminate\Database\Seeder;
use Modules\Certificate\Application\Services\CertificateService;
use Modules\Company\Domain\Models\Company;
use Modules\Course\Domain\Models\Course;
use Modules\Enrollment\Domain\Models\Enrollment;
use Modules\ModuleRegistry\Application\Services\ModuleRegistryService;
use Modules\ModuleRegistry\Domain\Models\Module;

class CertificateSeeder extends Seeder
{
    public function run(): void
    {
        app(ModuleRegistryService::class)->syncFromConfig();

        $company = Company::query()->where('slug', 'demo-academy')->first()
            ?? Company::query()->first();

        if ($company === null) {
            return;
        }

        $module = Module::query()->where('key', 'certificate')->first();
        if ($module) {
            $module->update(['is_enabled' => true]);
            $module->companies()->syncWithoutDetaching([
                $company->id => ['is_enabled' => true],
            ]);
        }

        $enrollment = Enrollment::query()
            ->withoutGlobalScope('company')
            ->where('company_id', $company->id)
            ->where('status', 'active')
            ->where('progress_percent', '>=', 100)
            ->with(['user', 'course'])
            ->first();

        if ($enrollment === null || $enrollment->user === null || $enrollment->course === null) {
            return;
        }

        /** @var CertificateService $certificateService */
        $certificateService = app(CertificateService::class);
        $certificateService->issueIfEligible($enrollment->user, $enrollment->course);
    }
}
