<?php

namespace Modules\Blog\Http\Controllers;

use App\Core\Support\ApiResponse;
use App\Core\Support\QueryFilter;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Blog\Application\Services\BlogService;
use Modules\Blog\Http\Resources\BlogPostResource;

class PublicBlogController extends Controller
{
    public function __construct(
        private readonly BlogService $blogService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $paginator = $this->blogService->listPublic(new QueryFilter($request));

        return ApiResponse::success(
            BlogPostResource::collection($paginator),
            __('api.blog.retrieved_list')
        );
    }

    public function show(string $slug): JsonResponse
    {
        $post = $this->blogService->findBySlug($slug);

        return ApiResponse::success(
            new BlogPostResource($post),
            __('api.blog.retrieved')
        );
    }
}
