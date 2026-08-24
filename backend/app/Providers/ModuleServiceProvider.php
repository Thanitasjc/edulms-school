<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Modules\Auth\Providers\AuthServiceProvider;
use Modules\Blog\Providers\BlogServiceProvider;
use Modules\Certificate\Providers\CertificateServiceProvider;
use Modules\Cms\Providers\CmsServiceProvider;
use Modules\Crm\Providers\CrmServiceProvider;
use Modules\Media\Providers\MediaServiceProvider;
use Modules\Company\Providers\CompanyServiceProvider;
use Modules\Course\Providers\CourseServiceProvider;
use Modules\Enrollment\Providers\EnrollmentServiceProvider;
use Modules\Instructor\Providers\InstructorServiceProvider;
use Modules\Payment\Providers\PaymentServiceProvider;
use Modules\ModuleRegistry\Providers\ModuleRegistryServiceProvider;
use Modules\Quiz\Providers\QuizServiceProvider;
use Modules\Role\Providers\RoleServiceProvider;
use Modules\Setting\Providers\SettingServiceProvider;
use Modules\User\Providers\UserServiceProvider;

class ModuleServiceProvider extends ServiceProvider
{
    /**
     * @var list<class-string>
     */
    private array $modules = [
        ModuleRegistryServiceProvider::class,
        CompanyServiceProvider::class,
        AuthServiceProvider::class,
        UserServiceProvider::class,
        RoleServiceProvider::class,
        SettingServiceProvider::class,
        CourseServiceProvider::class,
        InstructorServiceProvider::class,
        EnrollmentServiceProvider::class,
        PaymentServiceProvider::class,
        CmsServiceProvider::class,
        MediaServiceProvider::class,
        CrmServiceProvider::class,
        BlogServiceProvider::class,
        QuizServiceProvider::class,
        CertificateServiceProvider::class,
    ];

    public function register(): void
    {
        foreach ($this->modules as $provider) {
            $this->app->register($provider);
        }
    }

    public function boot(): void
    {
        //
    }
}
