<?php

namespace Modules\Media\Http\Controllers;

use App\Core\Support\ApiResponse;
use App\Core\Support\QueryFilter;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Media\Application\Services\MediaService;
use Modules\Media\Domain\Models\MediaAsset;
use Modules\Media\Http\Resources\MediaAssetResource;

class MediaController extends Controller
{
    public function __construct(
        private readonly MediaService $mediaService
    ) {}

    public function index(Request $request): JsonResponse
    {
        abort_unless($request->user()?->can('media.view') || $request->user()?->is_super_admin, 403);

        return ApiResponse::success(
            MediaAssetResource::collection($this->mediaService->listAdmin(new QueryFilter($request))),
            __('api.media.retrieved_list')
        );
    }

    public function store(Request $request): JsonResponse
    {
        abort_unless($request->user()?->can('media.create') || $request->user()?->is_super_admin, 403);

        $validated = $request->validate([
            'file' => ['required', 'file', 'image', 'mimes:jpg,jpeg,png,webp,gif', 'max:5120'],
            'collection' => ['nullable', 'string', 'max:100'],
        ]);

        /** @var \Illuminate\Http\UploadedFile $file */
        $file = $validated['file'];
        $asset = $this->mediaService->upload($file, $validated['collection'] ?? null);

        return ApiResponse::created(new MediaAssetResource($asset), __('api.media.uploaded'));
    }

    public function upload(Request $request): JsonResponse
    {
        abort_unless(
            $request->user()?->can('course.create')
            || $request->user()?->can('instructor.create')
            || $request->user()?->can('cms.create')
            || $request->user()?->can('media.create')
            || $request->user()?->is_super_admin,
            403
        );

        $validated = $request->validate([
            'file' => ['required', 'file', 'image', 'mimes:jpg,jpeg,png,webp,gif', 'max:5120'],
            'collection' => ['nullable', 'string', 'max:100'],
        ]);

        /** @var \Illuminate\Http\UploadedFile $file */
        $file = $validated['file'];
        $asset = $this->mediaService->upload($file, $validated['collection'] ?? null);

        return ApiResponse::created(new MediaAssetResource($asset), __('api.media.uploaded'));
    }

    public function destroy(Request $request, MediaAsset $mediaAsset): JsonResponse
    {
        abort_unless($request->user()?->can('media.delete') || $request->user()?->is_super_admin, 403);

        $this->mediaService->delete($mediaAsset->id);

        return ApiResponse::noContent(__('api.media.deleted'));
    }
}
