<?php

namespace App\Core\Support;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;

final class QueryFilter
{
    public function __construct(
        private readonly Request $request
    ) {}

    public function apply(Builder $query, array $searchable = [], array $filterable = [], array $sortable = ['id', 'created_at', 'updated_at']): Builder
    {
        $this->applySearch($query, $searchable);
        $this->applyFilters($query, $filterable);
        $this->applyTrashed($query);
        $this->applySort($query, $sortable);

        return $query;
    }

    public function perPage(int $default = 15, int $max = 100): int
    {
        $perPage = (int) $this->request->integer('per_page', $default);

        return max(1, min($perPage, $max));
    }

    private function applySearch(Builder $query, array $searchable): void
    {
        $search = trim((string) $this->request->query('search', ''));

        if ($search === '' || $searchable === []) {
            return;
        }

        $query->where(function (Builder $builder) use ($search, $searchable): void {
            foreach ($searchable as $column) {
                $builder->orWhere($column, 'like', '%'.$search.'%');
            }
        });
    }

    private function applyFilters(Builder $query, array $filterable): void
    {
        $filters = $this->request->query('filters', []);

        if (! is_array($filters)) {
            return;
        }

        foreach ($filters as $field => $value) {
            if (! in_array($field, $filterable, true) || $value === null || $value === '') {
                continue;
            }

            if (is_array($value)) {
                $query->whereIn($field, $value);

                continue;
            }

            $query->where($field, $value);
        }
    }

    private function applyTrashed(Builder $query): void
    {
        $trashed = $this->request->query('trashed');

        if ($trashed === 'only') {
            $query->onlyTrashed();
        } elseif ($trashed === 'with') {
            $query->withTrashed();
        }
    }

    private function applySort(Builder $query, array $sortable): void
    {
        $sort = (string) $this->request->query('sort', 'created_at');
        $direction = strtolower((string) $this->request->query('direction', 'desc')) === 'asc' ? 'asc' : 'desc';

        if (! in_array($sort, $sortable, true)) {
            $sort = 'created_at';
        }

        $query->orderBy($sort, $direction);
    }
}
