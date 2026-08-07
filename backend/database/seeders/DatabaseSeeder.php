<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Modules\Company\Domain\Models\Company;
use Modules\ModuleRegistry\Application\Services\ModuleRegistryService;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        $permissions = [
            'company.view', 'company.create', 'company.update', 'company.delete', 'company.restore', 'company.force_delete',
            'user.view', 'user.create', 'user.update', 'user.delete', 'user.restore',
            'role.view', 'role.create', 'role.update', 'role.delete',
            'permission.view',
            'setting.view', 'setting.create', 'setting.update', 'setting.delete', 'setting.restore',
            'module.view', 'module.update',
            'course.view', 'course.create', 'course.update', 'course.delete', 'course.restore',
            'instructor.view', 'instructor.create', 'instructor.update', 'instructor.delete', 'instructor.restore',
            'enrollment.view', 'enrollment.create', 'enrollment.update', 'enrollment.delete',
            'cms.view', 'cms.create', 'cms.update', 'cms.delete',
            'media.view', 'media.create', 'media.delete',
            'crm.view', 'crm.update', 'crm.delete',
            'blog.view', 'blog.create', 'blog.update', 'blog.delete',
            'quiz.view', 'quiz.create', 'quiz.update', 'quiz.delete',
            'certificate.view', 'certificate.create', 'certificate.update', 'certificate.delete',
        ];

        foreach ($permissions as $permission) {
            Permission::findOrCreate($permission, 'web');
        }

        $superAdminRole = Role::findOrCreate('super_admin', 'web');
        $companyAdminRole = Role::findOrCreate('company_admin', 'web');
        $instructorRole = Role::findOrCreate('instructor', 'web');
        $studentRole = Role::findOrCreate('student', 'web');

        $superAdminRole->syncPermissions(Permission::all());
        $companyAdminRole->syncPermissions($permissions);

        $instructorRole->syncPermissions([
            'course.view', 'course.create', 'course.update',
            'instructor.view', 'instructor.create', 'instructor.update',
            'enrollment.view',
            'cms.view',
            'media.view', 'media.create',
            'quiz.view', 'quiz.create', 'quiz.update',
            'certificate.view',
            'blog.view', 'blog.create', 'blog.update',
        ]);

        // Learners use the public site (My Learning, quizzes, certificates) — no admin panel perms.
        $studentRole->syncPermissions([]);

        /** @var ModuleRegistryService $moduleRegistry */
        $moduleRegistry = app(ModuleRegistryService::class);
        $moduleRegistry->syncFromConfig();

        $company = Company::query()->updateOrCreate(
            ['slug' => 'demo-academy'],
            [
                'name' => 'สถาบันตัวอย่าง',
                'email' => 'admin@demo-academy.test',
                'status' => 'active',
                'timezone' => 'Asia/Bangkok',
                'locale' => 'th',
            ]
        );

        $moduleRegistry->enableCoreModulesForCompany((int) $company->id);

        $superAdmin = User::query()->updateOrCreate(
            ['email' => 'superadmin@lms.test'],
            [
                'name' => 'ผู้ดูแลระบบสูงสุด',
                'password' => 'Password123!',
                'status' => 'active',
                'is_super_admin' => true,
                'current_company_id' => $company->id,
            ]
        );
        $superAdmin->companies()->syncWithoutDetaching([$company->id => ['is_default' => true]]);
        $superAdmin->syncRoles([$superAdminRole]);

        $admin = User::query()->updateOrCreate(
            ['email' => 'admin@demo-academy.test'],
            [
                'name' => 'ผู้ดูแลสถาบัน',
                'password' => 'Password123!',
                'status' => 'active',
                'is_super_admin' => false,
                'current_company_id' => $company->id,
            ]
        );
        $admin->companies()->syncWithoutDetaching([$company->id => ['is_default' => true]]);
        $admin->syncRoles([$companyAdminRole]);

        $instructorUser = User::query()->updateOrCreate(
            ['email' => 'instructor@demo-academy.test'],
            [
                'name' => 'วิทยากรตัวอย่าง',
                'password' => 'Password123!',
                'status' => 'active',
                'is_super_admin' => false,
                'current_company_id' => $company->id,
            ]
        );
        $instructorUser->companies()->syncWithoutDetaching([$company->id => ['is_default' => true]]);
        $instructorUser->syncRoles([$instructorRole]);

        $this->call([
            \Modules\Instructor\Database\Seeders\InstructorSeeder::class,
            \Modules\Course\Database\Seeders\CourseSeeder::class,
            \Modules\Enrollment\Database\Seeders\EnrollmentSeeder::class,
            \Modules\Course\Database\Seeders\CourseReviewSeeder::class,
            \Modules\Cms\Database\Seeders\CmsSeeder::class,
            \Modules\Blog\Database\Seeders\BlogSeeder::class,
            \Modules\Quiz\Database\Seeders\QuizSeeder::class,
            \Modules\Certificate\Database\Seeders\CertificateSeeder::class,
        ]);
    }
}
