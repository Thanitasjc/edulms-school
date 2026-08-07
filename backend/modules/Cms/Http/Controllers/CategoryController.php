<?php

namespace Modules\Cms\Http\Controllers;

use App\Core\Support\ApiResponse;
use App\Core\Support\QueryFilter;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Modules\Cms\Application\Services\CategoryService;
use Modules\Cms\Domain\Models\Category;
use Modules\Cms\Http\Resources\CategoryResource;

class CategoryController extends Controller
{
    public function __construct(
        private readonly CategoryService $categoryService
    ) {}

    public function publicIndex(): JsonResponse
    {
        return ApiResponse::success(
            CategoryResource::collection($this->categoryService->listPublic()),
            __('api.cms.categories_retrieved')
        );
    }

    public function index(Request $request): JsonResponse
    {
        abort_unless($request->user()?->can('cms.view') || $request->user()?->is_super_admin, 403);

        return ApiResponse::success(
            CategoryResource::collection($this->categoryService->listAdmin(new QueryFilter($request))),
            __('api.cms.categories_retrieved')
        );
    }

    public function store(Request $request): JsonResponse
    {
        abort_unless($request->user()?->can('cms.create') || $request->user()?->is_super_admin, 403);

        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255', 'alpha_dash'],
            'icon' => ['nullable', 'string', 'max:50'],
            'accent' => ['nullable', 'string', 'max:255'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
            'is_featured' => ['nullable', 'boolean'],
            'status' => ['nullable', Rule::in(['draft', 'published', 'archived'])],
        ]);

        $category = $this->categoryService->create($data);

        return ApiResponse::created(new CategoryResource($category), __('api.cms.category_created'));
    }

    public function update(Request $request, Category $category): JsonResponse
    {
        abort_unless($request->user()?->can('cms.update') || $request->user()?->is_super_admin, 403);

        $data = $request->validate([
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255', 'alpha_dash'],
            'icon' => ['nullable', 'string', 'max:50'],
            'accent' => ['nullable', 'string', 'max:255'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
            'is_featured' => ['nullable', 'boolean'],
            'status' => ['nullable', Rule::in(['draft', 'published', 'archived'])],
        ]);

        $category = $this->categoryService->update($category->id, $data);

        return ApiResponse::success(new CategoryResource($category), __('api.cms.category_updated'));
    }

    public function destroy(Request $request, Category $category): JsonResponse
    {
        abort_unless($request->user()?->can('cms.delete') || $request->user()?->is_super_admin, 403);

        $this->categoryService->delete($category->id);

        return ApiResponse::noContent(__('api.cms.category_deleted'));
    }
}
