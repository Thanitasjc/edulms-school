<?php

namespace Modules\Setting\Http\Controllers;

use App\Core\Support\ApiResponse;
use App\Core\Support\QueryFilter;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Setting\Application\Services\SettingService;
use Modules\Setting\Domain\Models\Setting;
use Modules\Setting\Http\Resources\SettingResource;

class SettingController extends Controller
{
    public function __construct(
        private readonly SettingService $settingService
    ) {}

    public function index(Request $request): JsonResponse
    {
        abort_unless($request->user()?->can('setting.view') || $request->user()?->is_super_admin, 403);

        $paginator = $this->settingService->list(new QueryFilter($request));

        return ApiResponse::success(
            SettingResource::collection($paginator),
            __('api.setting.retrieved_list')
        );
    }

    public function store(Request $request): JsonResponse
    {
        abort_unless($request->user()?->can('setting.create') || $request->user()?->is_super_admin, 403);

        $data = $request->validate([
            'company_id' => ['nullable', 'integer', 'exists:companies,id'],
            'group' => ['nullable', 'string', 'max:100'],
            'key' => ['required', 'string', 'max:150'],
            'value' => ['nullable'],
            'type' => ['nullable', 'string', 'max:50'],
            'is_public' => ['nullable', 'boolean'],
        ]);

        $setting = $this->settingService->upsert($data);

        return ApiResponse::created(
            new SettingResource($setting),
            __('api.setting.saved')
        );
    }

    public function update(Request $request, Setting $setting): JsonResponse
    {
        abort_unless($request->user()?->can('setting.update') || $request->user()?->is_super_admin, 403);

        $data = $request->validate([
            'group' => ['sometimes', 'nullable', 'string', 'max:100'],
            'key' => ['sometimes', 'required', 'string', 'max:150'],
            'value' => ['sometimes', 'nullable'],
            'type' => ['sometimes', 'nullable', 'string', 'max:50'],
            'is_public' => ['sometimes', 'nullable', 'boolean'],
        ]);

        $setting = $this->settingService->upsert(array_merge([
            'company_id' => $setting->company_id,
            'group' => $setting->group,
            'key' => $setting->key,
        ], $data));

        return ApiResponse::success(
            new SettingResource($setting),
            __('api.setting.updated')
        );
    }

    public function destroy(Request $request, Setting $setting): JsonResponse
    {
        abort_unless($request->user()?->can('setting.delete') || $request->user()?->is_super_admin, 403);

        $this->settingService->delete($setting);

        return ApiResponse::noContent(__('api.setting.deleted'));
    }

    public function restore(Request $request, int $setting): JsonResponse
    {
        abort_unless($request->user()?->can('setting.restore') || $request->user()?->is_super_admin, 403);

        $restored = $this->settingService->restore($setting);

        return ApiResponse::success(
            new SettingResource($restored),
            __('api.setting.restored')
        );
    }
}
