<?php

namespace Modules\Instructor\Application\Services;

use App\Core\Support\QueryFilter;
use App\Core\Support\TenantContext;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Modules\Instructor\Domain\Models\Instructor;
use Throwable;

class InstructorService
{
    public function listPublic(int $limit = 12): Collection
    {
        return Instructor::query()
            ->withoutGlobalScope('company')
            ->published()
            ->orderBy('name')
            ->limit($limit)
            ->get();
    }

    public function paginatePublic(QueryFilter $queryFilter): LengthAwarePaginator
    {
        $query = Instructor::query()
            ->withoutGlobalScope('company')
            ->published();

        $queryFilter->apply(
            $query,
            searchable: ['name', 'role', 'subtitle', 'email'],
            filterable: ['status'],
            sortable: ['id', 'name', 'rating', 'reviews_count', 'created_at']
        );

        return $query->paginate($queryFilter->perPage());
    }

    public function findPublishedBySlug(string $slug): Instructor
    {
        /** @var Instructor $instructor */
        $instructor = Instructor::query()
            ->withoutGlobalScope('company')
            ->published()
            ->where('slug', $slug)
            ->firstOrFail();

        return $instructor;
    }

    public function listAdmin(QueryFilter $queryFilter): LengthAwarePaginator
    {
        $query = Instructor::query();

        $queryFilter->apply(
            $query,
            searchable: ['name', 'slug', 'role', 'email'],
            filterable: ['status'],
            sortable: ['id', 'name', 'status', 'rating', 'created_at', 'updated_at']
        );

        return $query->paginate($queryFilter->perPage());
    }

    public function findAdmin(int $id): Instructor
    {
        /** @var Instructor $instructor */
        $instructor = Instructor::query()->findOrFail($id);

        return $instructor;
    }

    /**
     * @throws Throwable
     */
    public function create(array $data): Instructor
    {
        return DB::transaction(function () use ($data): Instructor {
            $companyId = $data['company_id'] ?? TenantContext::id();
            $data['slug'] = $this->uniqueSlug($data['slug'] ?? $data['name'], $companyId);
            $data['about'] = $this->normalizeStringList($data['about'] ?? null);
            $data['skill_labels'] = $this->normalizeStringList($data['skill_labels'] ?? null);

            /** @var Instructor $instructor */
            $instructor = Instructor::query()->create($data);

            return $instructor;
        });
    }

    /**
     * @throws Throwable
     */
    public function update(int $id, array $data): Instructor
    {
        return DB::transaction(function () use ($id, $data): Instructor {
            $instructor = $this->findAdmin($id);

            if (array_key_exists('slug', $data) || array_key_exists('name', $data)) {
                $slugSource = $data['slug'] ?? $data['name'] ?? $instructor->name;
                $data['slug'] = $this->uniqueSlug((string) $slugSource, (int) $instructor->company_id, $instructor->id);
            }

            if (array_key_exists('about', $data)) {
                $data['about'] = $this->normalizeStringList($data['about']);
            }

            if (array_key_exists('skill_labels', $data)) {
                $data['skill_labels'] = $this->normalizeStringList($data['skill_labels']);
            }

            $instructor->update($data);

            return $instructor->refresh();
        });
    }

    /**
     * @throws Throwable
     */
    public function delete(int $id): bool
    {
        return DB::transaction(function () use ($id): bool {
            $instructor = $this->findAdmin($id);

            return (bool) $instructor->delete();
        });
    }

    /**
     * @throws Throwable
     */
    public function restore(int $id): Instructor
    {
        return DB::transaction(function () use ($id): Instructor {
            /** @var Instructor $instructor */
            $instructor = Instructor::withTrashed()->findOrFail($id);
            $instructor->restore();

            return $instructor->refresh();
        });
    }

    private function uniqueSlug(string $value, ?int $companyId, ?int $ignoreId = null): string
    {
        $base = Str::slug($value);
        $slug = $base !== '' ? $base : 'instructor';
        $counter = 1;

        while (
            Instructor::withTrashed()
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

    /**
     * @return list<string>
     */
    private function normalizeStringList(mixed $value): array
    {
        if (is_string($value)) {
            $value = preg_split('/\r\n|\r|\n|,/', $value) ?: [];
        }

        if (! is_array($value)) {
            return [];
        }

        $items = [];
        foreach ($value as $item) {
            $text = trim((string) $item);
            if ($text !== '') {
                $items[] = $text;
            }
        }

        return array_values(array_unique($items));
    }
}
