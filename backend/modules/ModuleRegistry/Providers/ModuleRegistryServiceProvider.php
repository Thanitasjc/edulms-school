<?php

namespace Modules\ModuleRegistry\Providers;

use Illuminate\Support\Facades\Route;
use Illuminate\Support\ServiceProvider;

class ModuleRegistryServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->singleton(\Modules\ModuleRegistry\Application\Services\ModuleRegistryService::class);
    }

    public function boot(): void
    {
        $this->loadMigrationsFrom(__DIR__.'/../Database/Migrations');

        Route::middleware('api')
            ->prefix('api/v1')
            ->group(__DIR__.'/../Routes/api.php');
    }
}
