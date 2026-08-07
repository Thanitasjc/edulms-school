<?php

namespace Modules\Media\Application\Services;

use App\Core\Support\QueryFilter;
use App\Core\Support\TenantContext;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Modules\Media\Domain\Models\MediaAsset;
use Throwable;

class MediaService
{
    public function listAdmin(QueryFilter $queryFilter): LengthAwarePaginator
    {
        $query = MediaAsset::query()->with('uploader');

        $queryFilter->apply(
            $query,
            searchable: ['original_name', 'path', 'collection'],
            filterable: ['collection', 'mime'],
            sortable: ['id', 'original_name', 'size', 'created_at', 'updated_at']
        );

        return $query->paginate($queryFilter->perPage());
    }

    public function findAdmin(int $id): MediaAsset
    {
        /** @var MediaAsset $asset */
        $asset = MediaAsset::query()->findOrFail($id);

        return $asset;
    }

    /**
     * @throws Throwable
     */
    public function upload(UploadedFile $file, ?string $collection = null): MediaAsset
    {
        return DB::transaction(function () use ($file, $collection): MediaAsset {
            $collection = $collection ?? 'images';
            $disk = 'public';
            $path = $file->store('media/'.$collection, $disk);

            /** @var MediaAsset $asset */
            $asset = MediaAsset::query()->create([
                'company_id' => TenantContext::id(),
                'disk' => $disk,
                'path' => $path,
                'url' => asset('storage/'.$path),
                'original_name' => $file->getClientOriginalName(),
                'mime' => $file->getMimeType(),
                'size' => $file->getSize(),
                'collection' => $collection,
                'uploaded_by' => auth()->id(),
            ]);

            return $asset->load('uploader');
        });
    }

    /**
     * @throws Throwable
     */
    public function delete(int $id): bool
    {
        return DB::transaction(function () use ($id): bool {
            $asset = $this->findAdmin($id);

            if ($asset->path !== '' && Storage::disk($asset->disk)->exists($asset->path)) {
                Storage::disk($asset->disk)->delete($asset->path);
            }

            return (bool) $asset->delete();
        });
    }
}
