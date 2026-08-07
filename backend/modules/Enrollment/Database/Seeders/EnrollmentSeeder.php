<?php

namespace Modules\Enrollment\Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Modules\Company\Domain\Models\Company;
use Modules\Course\Domain\Models\Course;
use Modules\Enrollment\Application\Services\EnrollmentService;
use Modules\ModuleRegistry\Application\Services\ModuleRegistryService;
use Modules\ModuleRegistry\Domain\Models\Module;
use Spatie\Permission\Models\Role;

class EnrollmentSeeder extends Seeder
{
    public function run(): void
    {
        app(ModuleRegistryService::class)->syncFromConfig();

        $company = Company::query()->where('slug', 'demo-academy')->first()
            ?? Company::query()->first();

        if ($company === null) {
            return;
        }

        $module = Module::query()->where('key', 'enrollment')->first();
        if ($module) {
            $module->update(['is_enabled' => true]);
            $module->companies()->syncWithoutDetaching([
                $company->id => ['is_enabled' => true],
            ]);
        }

        $studentRole = Role::findOrCreate('student', 'web');

        $student = User::query()->updateOrCreate(
            ['email' => 'student@demo-academy.test'],
            [
                'name' => 'นักเรียนตัวอย่าง',
                'password' => 'Password123!',
                'status' => 'active',
                'is_super_admin' => false,
                'current_company_id' => $company->id,
            ]
        );
        $student->companies()->syncWithoutDetaching([$company->id => ['is_default' => true]]);
        $student->syncRoles([$studentRole]);

        $paidCourse = Course::query()
            ->withoutGlobalScope('company')
            ->where('company_id', $company->id)
            ->where('is_free', false)
            ->where('price', '>', 0)
            ->published()
            ->first();

        if ($paidCourse) {
            try {
                app(EnrollmentService::class)->purchase($student, (int) $paidCourse->id);
            } catch (\Throwable) {
                // already enrolled
            }
        }
    }
}
