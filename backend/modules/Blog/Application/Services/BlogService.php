<?php

namespace Modules\Blog\Application\Services;

use App\Core\Support\QueryFilter;
use App\Core\Support\TenantContext;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Modules\Blog\Domain\Models\BlogPost;
use Throwable;

class BlogService
{
    public function listPublic(QueryFilter $queryFilter): LengthAwarePaginator
    {
        $query = BlogPost::query()
            ->withoutGlobalScope('company')
            ->published()
            ->orderByDesc('published_at');

        $queryFilter->apply(
            $query,
            searchable: ['title', 'excerpt', 'author_name'],
            filterable: [],
            sortable: ['id', 'title', 'published_at', 'created_at']
        );

        return $query->paginate($queryFilter->perPage());
    }

    public function findBySlug(string $slug): BlogPost
    {
        /** @var BlogPost $post */
        $post = BlogPost::query()
            ->withoutGlobalScope('company')
            ->published()
            ->where('slug', $slug)
            ->firstOrFail();

        return $post;
    }

    public function listAdmin(QueryFilter $queryFilter): LengthAwarePaginator
    {
        $query = BlogPost::query();

        $queryFilter->apply(
            $query,
            searchable: ['title', 'slug', 'excerpt', 'author_name'],
            filterable: ['status'],
            sortable: ['id', 'title', 'status', 'published_at', 'created_at', 'updated_at']
        );

        return $query->paginate($queryFilter->perPage());
    }

    public function findAdmin(int $id): BlogPost
    {
        /** @var BlogPost $post */
        $post = BlogPost::query()->findOrFail($id);

        return $post;
    }

    /**
     * @throws Throwable
     */
    public function create(array $data): BlogPost
    {
        return DB::transaction(function () use ($data): BlogPost {
            $companyId = $data['company_id'] ?? TenantContext::id();
            $data['slug'] = $this->uniqueSlug($data['slug'] ?? $data['title'], $companyId);
            $data = $this->applyPublishTimestamps($data);

            /** @var BlogPost $post */
            $post = BlogPost::query()->create($data);

            return $post;
        });
    }

    /**
     * @throws Throwable
     */
    public function update(int $id, array $data): BlogPost
    {
        return DB::transaction(function () use ($id, $data): BlogPost {
            $post = $this->findAdmin($id);

            if (array_key_exists('slug', $data) || array_key_exists('title', $data)) {
                $slugSource = $data['slug'] ?? $data['title'] ?? $post->title;
                $data['slug'] = $this->uniqueSlug((string) $slugSource, (int) $post->company_id, $post->id);
            }

            $data = $this->applyPublishTimestamps($data, $post);

            $post->update($data);

            return $post->refresh();
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
        $slug = $base !== '' ? $base : 'post';
        $counter = 1;

        while (
            BlogPost::withTrashed()
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
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    private function applyPublishTimestamps(array $data, ?BlogPost $existing = null): array
    {
        if (($data['status'] ?? $existing?->status) === 'published') {
            if ($existing === null || $existing->published_at === null) {
                $data['published_at'] = $data['published_at'] ?? now();
            }
        }

        return $data;
    }
}
