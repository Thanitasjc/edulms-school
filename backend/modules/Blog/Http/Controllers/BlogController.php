<?php

namespace Modules\Blog\Http\Controllers;

use App\Core\Support\ApiResponse;
use App\Core\Support\QueryFilter;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Modules\Blog\Application\Services\BlogService;
use Modules\Blog\Domain\Models\BlogPost;
use Modules\Blog\Http\Resources\BlogPostResource;

class BlogController extends Controller
{
    public function __construct(
        private readonly BlogService $blogService
    ) {}

    public function index(Request $request): JsonResponse
    {
        abort_unless($request->user()?->can('blog.view') || $request->user()?->is_super_admin, 403);

        return ApiResponse::success(
            BlogPostResource::collection($this->blogService->listAdmin(new QueryFilter($request))),
            __('api.blog.retrieved_list')
        );
    }

    public function store(Request $request): JsonResponse
    {
        abort_unless($request->user()?->can('blog.create') || $request->user()?->is_super_admin, 403);

        $data = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255', 'alpha_dash'],
            'excerpt' => ['nullable', 'string', 'max:1000'],
            'body' => ['nullable', 'string'],
            'cover_url' => ['nullable', 'string', 'max:500'],
            'author_name' => ['nullable', 'string', 'max:255'],
            'status' => ['nullable', Rule::in(['draft', 'published'])],
            'published_at' => ['nullable', 'date'],
        ]);

        $post = $this->blogService->create($data);

        return ApiResponse::created(new BlogPostResource($post), __('api.blog.created'));
    }

    public function show(Request $request, BlogPost $blogPost): JsonResponse
    {
        abort_unless($request->user()?->can('blog.view') || $request->user()?->is_super_admin, 403);

        return ApiResponse::success(new BlogPostResource($blogPost), __('api.blog.retrieved'));
    }

    public function update(Request $request, BlogPost $blogPost): JsonResponse
    {
        abort_unless($request->user()?->can('blog.update') || $request->user()?->is_super_admin, 403);

        $data = $request->validate([
            'title' => ['sometimes', 'required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255', 'alpha_dash'],
            'excerpt' => ['nullable', 'string', 'max:1000'],
            'body' => ['nullable', 'string'],
            'cover_url' => ['nullable', 'string', 'max:500'],
            'author_name' => ['nullable', 'string', 'max:255'],
            'status' => ['nullable', Rule::in(['draft', 'published'])],
            'published_at' => ['nullable', 'date'],
        ]);

        $post = $this->blogService->update($blogPost->id, $data);

        return ApiResponse::success(new BlogPostResource($post), __('api.blog.updated'));
    }

    public function destroy(Request $request, BlogPost $blogPost): JsonResponse
    {
        abort_unless($request->user()?->can('blog.delete') || $request->user()?->is_super_admin, 403);

        $this->blogService->delete($blogPost->id);

        return ApiResponse::noContent(__('api.blog.deleted'));
    }
}
