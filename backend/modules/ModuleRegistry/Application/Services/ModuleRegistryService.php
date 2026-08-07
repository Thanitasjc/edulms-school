<?php

namespace Modules\ModuleRegistry\Application\Services;

use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Cache;
use Modules\ModuleRegistry\Domain\Models\Module;

class ModuleRegistryService
{
    public function syncFromConfig(): void
    {
        $registry = config('modules.registry', []);

        foreach ($registry as $key => $meta) {
            Module::query()->updateOrCreate(
                ['key' => $key],
                [
                    'name' => $meta['name'],
                    'description' => $meta['description'] ?? null,
                    'is_core' => in_array($key, ['auth', 'company', 'user', 'role', 'permission', 'setting'], true),
                    'is_enabled' => (bool) ($meta['enabled'] ?? false),
                    'dependencies' => $meta['dependencies'] ?? [],
                ]
            );
        }

        Cache::forget('modules.registry');
    }

    public function isEnabled(string $moduleKey, ?int $companyId = null): bool
    {
        $module = Module::query()->where('key', $moduleKey)->first();

        if ($module === null) {
            $configEnabled = (bool) config("modules.registry.{$moduleKey}.enabled", false);

            return $configEnabled;
        }

        if (! $module->is_enabled) {
            return false;
        }

        if ($companyId === null || $module->is_core) {
            return true;
        }

        $pivot = $module->companies()
            ->where('companies.id', $companyId)
            ->first();

        if ($pivot === null) {
            return false;
        }

        return (bool) $pivot->pivot->is_enabled;
    }

    /**
     * @return list<string>
     */
    public function enabledKeysForCompany(?int $companyId): array
    {
        $modules = Module::query()->where('is_enabled', true)->orderBy('sort_order')->get();

        return $modules
            ->filter(fn (Module $module) => $this->isEnabled($module->key, $companyId))
            ->pluck('key')
            ->values()
            ->all();
    }

    public function enableCoreModulesForCompany(int $companyId): void
    {
        $coreModules = Module::query()->where('is_core', true)->get();

        foreach ($coreModules as $module) {
            $module->companies()->syncWithoutDetaching([
                $companyId => ['is_enabled' => true],
            ]);
        }

        // Enable globally-enabled non-core modules for new tenants by default when marked enabled in config.
        $enabledNonCore = Module::query()
            ->where('is_core', false)
            ->where('is_enabled', true)
            ->get();

        foreach ($enabledNonCore as $module) {
            $module->companies()->syncWithoutDetaching([
                $companyId => ['is_enabled' => true],
            ]);
        }
    }

    public function all(): Collection
    {
        return Module::query()->orderBy('sort_order')->orderBy('name')->get();
    }
}
