<?php

namespace Modules\Role\Http\Controllers;

use App\Core\Support\ApiResponse;
use App\Core\Support\QueryFilter;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RoleController extends Controller
{
    /** @var list<string> */
    private const SYSTEM_ROLES = ['super_admin', 'company_admin', 'instructor', 'student'];

    public function index(Request $request): JsonResponse
    {
        abort_unless($request->user()?->can('role.view') || $request->user()?->is_super_admin, 403);

        $query = Role::query()->with('permissions');
        $filter = new QueryFilter($request);
        $filter->apply($query, ['name'], ['guard_name'], ['id', 'name', 'created_at', 'updated_at']);

        $paginator = $query->paginate($filter->perPage());
        $roles = $paginator->getCollection()->map(fn (Role $role) => $this->toPayload($role))->values();

        return ApiResponse::success(
            $roles,
            __('api.role.retrieved_list'),
            200,
            [
                'current_page' => $paginator->currentPage(),
                'last_page' => $paginator->lastPage(),
                'per_page' => $paginator->perPage(),
                'total' => $paginator->total(),
                'from' => $paginator->firstItem(),
                'to' => $paginator->lastItem(),
            ]
        );
    }

    public function store(Request $request): JsonResponse
    {
        abort_unless($request->user()?->can('role.create') || $request->user()?->is_super_admin, 403);

        $data = $request->validate([
            'name' => ['required', 'string', 'max:255', 'unique:roles,name'],
            'guard_name' => ['nullable', 'string', 'max:255'],
            'permissions' => ['nullable', 'array'],
            'permissions.*' => ['string', 'exists:permissions,name'],
        ]);

        $role = Role::create([
            'name' => $data['name'],
            'guard_name' => $data['guard_name'] ?? 'web',
        ]);

        if (! empty($data['permissions'])) {
            $role->syncPermissions($data['permissions']);
        }

        return ApiResponse::created($this->toPayload($role->load('permissions')), __('api.role.created'));
    }

    public function show(Request $request, Role $role): JsonResponse
    {
        abort_unless($request->user()?->can('role.view') || $request->user()?->is_super_admin, 403);

        $role->load('permissions');

        return ApiResponse::success($this->toPayload($role), __('api.role.retrieved'));
    }

    public function update(Request $request, Role $role): JsonResponse
    {
        abort_unless($request->user()?->can('role.update') || $request->user()?->is_super_admin, 403);

        $data = $request->validate([
            'name' => ['sometimes', 'required', 'string', 'max:255', Rule::unique('roles', 'name')->ignore($role->id)],
            'permissions' => ['sometimes', 'nullable', 'array'],
            'permissions.*' => ['string', 'exists:permissions,name'],
        ]);

        if (isset($data['name']) && $data['name'] !== $role->name && $this->isSystemRole($role->name)) {
            abort(422, __('api.role.system_protected'));
        }

        if (isset($data['name'])) {
            $role->name = $data['name'];
            $role->save();
        }

        if (array_key_exists('permissions', $data)) {
            $role->syncPermissions($data['permissions'] ?? []);
        }

        $role->load('permissions');

        return ApiResponse::success($this->toPayload($role), __('api.role.updated'));
    }

    public function destroy(Request $request, Role $role): JsonResponse
    {
        abort_unless($request->user()?->can('role.delete') || $request->user()?->is_super_admin, 403);

        if ($this->isSystemRole($role->name)) {
            abort(422, __('api.role.system_protected'));
        }

        $role->delete();

        return ApiResponse::noContent(__('api.role.deleted'));
    }

    public function permissions(Request $request): JsonResponse
    {
        abort_unless($request->user()?->can('permission.view') || $request->user()?->is_super_admin, 403);

        $permissions = Permission::query()->orderBy('name')->pluck('name')->values();

        return ApiResponse::success($permissions, __('api.role.permissions_retrieved'));
    }

    private function isSystemRole(string $name): bool
    {
        return in_array($name, self::SYSTEM_ROLES, true);
    }

    /**
     * @return array{id: int, name: string, guard_name: string, permissions: list<string>, created_at: string|null, updated_at: string|null}
     */
    private function toPayload(Role $role): array
    {
        return [
            'id' => $role->id,
            'name' => $role->name,
            'guard_name' => $role->guard_name,
            'permissions' => $role->permissions->pluck('name')->values()->all(),
            'created_at' => $role->created_at?->toIso8601String(),
            'updated_at' => $role->updated_at?->toIso8601String(),
        ];
    }
}
