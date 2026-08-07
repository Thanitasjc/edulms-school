<?php

namespace Modules\Company\Providers;

use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\ServiceProvider;
use Modules\Company\Application\Contracts\CompanyRepositoryInterface;
use Modules\Company\Domain\Models\Company;
use Modules\Company\Domain\Policies\CompanyPolicy;
use Modules\Company\Infrastructure\Repositories\CompanyRepository;

class CompanyServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->bind(CompanyRepositoryInterface::class, CompanyRepository::class);
    }

    public function boot(): void
    {
        $this->loadMigrationsFrom(__DIR__.'/../Database/Migrations');

        Gate::policy(Company::class, CompanyPolicy::class);

        Route::middleware('api')
            ->prefix('api/v1')
            ->group(__DIR__.'/../Routes/api.php');
    }
}
