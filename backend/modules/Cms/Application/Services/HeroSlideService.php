<?php

namespace Modules\Cms\Application\Services;

use App\Core\Support\QueryFilter;
use App\Core\Support\TenantContext;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use Modules\Cms\Domain\Models\HeroSlide;
use Throwable;

class HeroSlideService
{
    public function listPublic(): Collection
    {
        return HeroSlide::query()
            ->withoutGlobalScope('company')
            ->active()
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get();
    }

    public function listAdmin(QueryFilter $queryFilter): LengthAwarePaginator
    {
        $query = HeroSlide::query();

        $queryFilter->apply(
            $query,
            searchable: ['title', 'subtitle'],
            filterable: ['is_active'],
            sortable: ['id', 'sort_order', 'created_at', 'updated_at']
        );

        return $query->paginate($queryFilter->perPage());
    }

    public function findAdmin(int $id): HeroSlide
    {
        /** @var HeroSlide $slide */
        $slide = HeroSlide::query()->findOrFail($id);

        return $slide;
    }

    /**
     * @throws Throwable
     */
    public function create(array $data): HeroSlide
    {
        return DB::transaction(function () use ($data): HeroSlide {
            $data['company_id'] = $data['company_id'] ?? TenantContext::id();

            /** @var HeroSlide $slide */
            $slide = HeroSlide::query()->create($data);

            return $slide;
        });
    }

    /**
     * @throws Throwable
     */
    public function update(int $id, array $data): HeroSlide
    {
        return DB::transaction(function () use ($id, $data): HeroSlide {
            $slide = $this->findAdmin($id);
            $slide->update($data);

            return $slide->refresh();
        });
    }

    /**
     * @throws Throwable
     */
    public function delete(int $id): bool
    {
        return DB::transaction(function () use ($id): bool {
            return (bool) $this->findAdmin($id)->delete();
        });
    }
}
