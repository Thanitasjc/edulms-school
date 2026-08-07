<?php

namespace Modules\Auth\Http\Controllers;

use App\Core\Support\ApiResponse;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Auth\Application\Services\AuthService;
use Modules\Auth\Http\Requests\LoginRequest;
use Modules\Auth\Http\Requests\RegisterRequest;
use Modules\Auth\Http\Resources\AuthUserResource;
use Modules\ModuleRegistry\Application\Services\ModuleRegistryService;

class AuthController extends Controller
{
    public function __construct(
        private readonly AuthService $authService,
        private readonly ModuleRegistryService $moduleRegistryService
    ) {}

    public function register(RegisterRequest $request): JsonResponse
    {
        $result = $this->authService->register($request->validated());

        return ApiResponse::created([
            'token' => $result['token'],
            'token_type' => 'Bearer',
            'user' => new AuthUserResource($result['user']),
            'enabled_modules' => $this->moduleRegistryService->enabledKeysForCompany(
                (int) $result['user']->current_company_id
            ),
        ], __('api.auth.registered'));
    }

    public function login(LoginRequest $request): JsonResponse
    {
        $result = $this->authService->login(
            $request->validated('email'),
            $request->validated('password'),
            $request->validated('device_name', 'web')
        );

        return ApiResponse::success([
            'token' => $result['token'],
            'token_type' => 'Bearer',
            'user' => new AuthUserResource($result['user']),
            'enabled_modules' => $this->moduleRegistryService->enabledKeysForCompany(
                $result['user']->current_company_id ? (int) $result['user']->current_company_id : null
            ),
        ], __('api.auth.logged_in'));
    }

    public function me(Request $request): JsonResponse
    {
        $user = $request->user()->load(['companies', 'currentCompany', 'roles', 'permissions']);

        return ApiResponse::success([
            'user' => new AuthUserResource($user),
            'enabled_modules' => $this->moduleRegistryService->enabledKeysForCompany(
                $user->current_company_id ? (int) $user->current_company_id : null
            ),
        ], __('api.auth.profile_retrieved'));
    }

    public function logout(Request $request): JsonResponse
    {
        $this->authService->logout($request->user());

        return ApiResponse::noContent(__('api.auth.logged_out'));
    }

    public function logoutAll(Request $request): JsonResponse
    {
        $this->authService->logoutAll($request->user());

        return ApiResponse::noContent(__('api.auth.logged_out_all'));
    }
}
