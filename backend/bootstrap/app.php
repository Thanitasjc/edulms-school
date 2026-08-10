<?php

use App\Core\Http\Middleware\EnsureModuleEnabled;
use App\Core\Http\Middleware\ForceJsonResponse;
use App\Core\Http\Middleware\OptionalSanctumAuth;
use App\Core\Http\Middleware\ResolveTenant;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Spatie\Permission\Middleware\PermissionMiddleware;
use Spatie\Permission\Middleware\RoleMiddleware;
use Spatie\Permission\Middleware\RoleOrPermissionMiddleware;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
        apiPrefix: 'api',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->trustProxies(at: '*');

        $middleware->api(prepend: [
            ForceJsonResponse::class,
        ]);

        $middleware->alias([
            'tenant' => ResolveTenant::class,
            'module' => EnsureModuleEnabled::class,
            'auth.optional' => OptionalSanctumAuth::class,
            'role' => RoleMiddleware::class,
            'permission' => PermissionMiddleware::class,
            'role_or_permission' => RoleOrPermissionMiddleware::class,
        ]);

        // Token-based Sanctum auth (Bearer). Do not enable statefulApi()
        // here — it forces CSRF for SPA cookie sessions and breaks API login.
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->shouldRenderJsonWhen(function (Request $request, Throwable $e) {
            return $request->is('api/*') || $request->expectsJson();
        });

        $exceptions->render(function (Throwable $e, Request $request) {
            if (! $request->is('api/*') && ! $request->expectsJson()) {
                return null;
            }

            if ($e instanceof ModelNotFoundException || $e instanceof NotFoundHttpException) {
                return response()->json([
                    'success' => false,
                    'message' => __('api.not_found'),
                    'code' => 'NotFound',
                ], 404);
            }

            $status = $e instanceof HttpExceptionInterface ? $e->getStatusCode() : 500;
            $message = $e instanceof HttpExceptionInterface
                ? ($e->getMessage() ?: __('api.http_error'))
                : (config('app.debug') ? $e->getMessage() : __('api.server_error'));

            return response()->json([
                'success' => false,
                'message' => $message,
                'code' => class_basename($e),
            ], $status);
        });
    })->create();
