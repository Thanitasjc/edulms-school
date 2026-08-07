<?php

namespace Modules\Cms\Application\Services;

use App\Core\Support\QueryFilter;
use App\Core\Support\TenantContext;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Modules\Cms\Domain\Models\Category;
use Modules\Course\Domain\Models\Course;
use Throwable;

class CategoryService
{
    public function listPublic(): Collection
    {
        $categories = Category::query()
            ->withoutGlobalScope('company')
            ->published()
            ->where('is_featured', true)
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get();

        return $categories->map(function (Category $category) {
            $count = Course::query()
                ->withoutGlobalScope('company')
                ->published()
                ->where('category', $category->slug)
                ->count();

            $category->setAttribute('courses_count', $count);

            return $category;
        });
    }

    public function listAdmin(QueryFilter $queryFilter): LengthAwarePaginator
    {
        $query = Category::query();

        $queryFilter->apply(
            $query,
            searchable: ['name', 'slug'],
            filterable: ['status', 'is_featured'],
            sortable: ['id', 'name', 'sort_order', 'created_at', 'updated_at']
        );

        return $query->paginate($queryFilter->perPage());
    }

    public function findAdmin(int $id): Category
    {
        /** @var Category $category */
        $category = Category::query()->findOrFail($id);

        return $category;
    }

    /**
     * @throws Throwable
     */
    public function create(array $data): Category
    {
        return DB::transaction(function () use ($data): Category {
            $companyId = $data['company_id'] ?? TenantContext::id();
            $data['slug'] = $this->uniqueSlug($data['slug'] ?? $data['name'], $companyId);

            /** @var Category $category */
            $category = Category::query()->create($data);

            return $category;
        });
    }

    /**
     * @throws Throwable
     */
    public function update(int $id, array $data): Category
    {
        return DB::transaction(function () use ($id, $data): Category {
            $category = $this->findAdmin($id);

            if (array_key_exists('slug', $data) || array_key_exists('name', $data)) {
                $slugSource = $data['slug'] ?? $data['name'] ?? $category->name;
                $data['slug'] = $this->uniqueSlug((string) $slugSource, (int) $category->company_id, $category->id);
            }

            $category->update($data);

            return $category->refresh();
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

    private function uniqueSlug(string $value, ?int $companyId, ?int $ignoreId = null): string
    {
        $base = Str::slug($value);
        $slug = $base !== '' ? $base : 'category';
        $counter = 1;

        while (
            Category::withTrashed()
                ->withoutGlobalScope('company')
                ->where('company_id', $companyId)
                ->where('slug', $slug)
                ->when($ignoreId, fn ($query) => $query->where('id', '!=', $ignoreId))
                ->exists()
        ) {
            $slug = $base.'-'.$counter;
            $counter++;
        }

        return $slug;
    }
}
