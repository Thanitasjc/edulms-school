<?php

namespace Modules\User\Http\Controllers;

use App\Core\Support\ApiResponse;
use App\Core\Support\QueryFilter;
use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\User\Application\Services\UserService;
use Modules\User\Http\Requests\StoreUserRequest;
use Modules\User\Http\Requests\UpdateUserRequest;
use Modules\User\Http\Resources\UserResource;

class UserController extends Controller
{
    public function __construct(
        private readonly UserService $userService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', User::class);

        $paginator = $this->userService->list(new QueryFilter($request));

        return ApiResponse::success(
            UserResource::collection($paginator),
            __('api.user.retrieved_list')
        );
    }

    public function store(StoreUserRequest $request): JsonResponse
    {
        $this->authorize('create', User::class);

        $user = $this->userService->create($request->validated());

        return ApiResponse::created(
            new UserResource($user),
            __('api.user.created')
        );
    }

    public function show(User $user): JsonResponse
    {
        $this->authorize('view', $user);

        $user->load(['roles', 'companies']);

        return ApiResponse::success(
            new UserResource($user),
            __('api.user.retrieved')
        );
    }

    public function update(UpdateUserRequest $request, User $user): JsonResponse
    {
        $this->authorize('update', $user);

        $user = $this->userService->update($user, $request->validated());

        return ApiResponse::success(
            new UserResource($user),
            __('api.user.updated')
        );
    }

    public function destroy(User $user): JsonResponse
    {
        $this->authorize('delete', $user);

        $this->userService->delete($user);

        return ApiResponse::noContent(__('api.user.deleted'));
    }

    public function restore(int $user): JsonResponse
    {
        $restored = $this->userService->restore($user);
        $this->authorize('restore', $restored);

        return ApiResponse::success(
            new UserResource($restored),
            __('api.user.restored')
        );
    }
}
