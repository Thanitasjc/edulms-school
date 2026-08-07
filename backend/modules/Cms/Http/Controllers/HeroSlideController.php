<?php

namespace Modules\Cms\Http\Controllers;

use App\Core\Support\ApiResponse;
use App\Core\Support\QueryFilter;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Cms\Application\Services\HeroSlideService;
use Modules\Cms\Domain\Models\HeroSlide;
use Modules\Cms\Http\Resources\HeroSlideResource;

class HeroSlideController extends Controller
{
    public function __construct(
        private readonly HeroSlideService $heroSlideService
    ) {}

    public function publicIndex(): JsonResponse
    {
        return ApiResponse::success(
            HeroSlideResource::collection($this->heroSlideService->listPublic()),
            __('api.cms.hero_retrieved')
        );
    }

    public function index(Request $request): JsonResponse
    {
        abort_unless($request->user()?->can('cms.view') || $request->user()?->is_super_admin, 403);

        return ApiResponse::success(
            HeroSlideResource::collection($this->heroSlideService->listAdmin(new QueryFilter($request))),
            __('api.cms.hero_retrieved')
        );
    }

    public function store(Request $request): JsonResponse
    {
        abort_unless($request->user()?->can('cms.create') || $request->user()?->is_super_admin, 403);

        $data = $request->validate([
            'subtitle' => ['nullable', 'string', 'max:255'],
            'title' => ['required', 'string', 'max:255'],
            'title_accent' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'cta_label' => ['nullable', 'string', 'max:100'],
            'cta_href' => ['nullable', 'string', 'max:500'],
            'image_url' => ['nullable', 'string', 'max:500'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        $slide = $this->heroSlideService->create($data);

        return ApiResponse::created(new HeroSlideResource($slide), __('api.cms.hero_created'));
    }

    public function update(Request $request, HeroSlide $heroSlide): JsonResponse
    {
        abort_unless($request->user()?->can('cms.update') || $request->user()?->is_super_admin, 403);

        $data = $request->validate([
            'subtitle' => ['nullable', 'string', 'max:255'],
            'title' => ['sometimes', 'required', 'string', 'max:255'],
            'title_accent' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'cta_label' => ['nullable', 'string', 'max:100'],
            'cta_href' => ['nullable', 'string', 'max:500'],
            'image_url' => ['nullable', 'string', 'max:500'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        $slide = $this->heroSlideService->update($heroSlide->id, $data);

        return ApiResponse::success(new HeroSlideResource($slide), __('api.cms.hero_updated'));
    }

    public function destroy(Request $request, HeroSlide $heroSlide): JsonResponse
    {
        abort_unless($request->user()?->can('cms.delete') || $request->user()?->is_super_admin, 403);

        $this->heroSlideService->delete($heroSlide->id);

        return ApiResponse::noContent(__('api.cms.hero_deleted'));
    }
}
