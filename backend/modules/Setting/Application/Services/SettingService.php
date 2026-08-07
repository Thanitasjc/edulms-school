<?php

namespace Modules\Setting\Application\Services;

use App\Core\Support\QueryFilter;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Modules\Setting\Domain\Models\Setting;
use Throwable;

class SettingService
{
    public function list(QueryFilter $queryFilter): LengthAwarePaginator
    {
        $query = Setting::query();
        $queryFilter->apply(
            $query,
            searchable: ['key', 'group'],
            filterable: ['group', 'type', 'is_public'],
            sortable: ['id', 'group', 'key', 'created_at', 'updated_at']
        );

        return $query->paginate($queryFilter->perPage());
    }

    /**
     * @throws Throwable
     */
    public function upsert(array $data): Setting
    {
        return DB::transaction(function () use ($data): Setting {
            $value = $data['value'] ?? null;

            if (is_array($value) || is_object($value)) {
                $data['value'] = json_encode($value);
                $data['type'] = $data['type'] ?? 'json';
            }

            /** @var Setting $setting */
            $setting = Setting::query()->updateOrCreate(
                [
                    'company_id' => $data['company_id'] ?? null,
                    'group' => $data['group'] ?? 'general',
                    'key' => $data['key'],
                ],
                [
                    'value' => $data['value'] ?? null,
                    'type' => $data['type'] ?? 'string',
                    'is_public' => $data['is_public'] ?? false,
                ]
            );

            return $setting;
        });
    }

    public function delete(Setting $setting): bool
    {
        return (bool) $setting->delete();
    }

    public function restore(int $id): Setting
    {
        /** @var Setting $setting */
        $setting = Setting::onlyTrashed()->findOrFail($id);
        $setting->restore();

        return $setting->refresh();
    }
}
