<?php

namespace App\Core\Repositories;

use App\Core\Contracts\RepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

abstract class BaseRepository implements RepositoryInterface
{
    public function __construct(
        protected readonly Model $model
    ) {}

    abstract protected function searchable(): array;

    abstract protected function filterable(): array;

    protected function sortable(): array
    {
        return ['id', 'created_at', 'updated_at'];
    }

    protected function newQuery(): Builder
    {
        return $this->model->newQuery();
    }

    public function paginate(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        $query = $this->newQuery();

        if (isset($filters['query_filter']) && is_callable($filters['query_filter'])) {
            $filters['query_filter']($query);
        }

        return $query->paginate($perPage);
    }

    public function all(array $columns = ['*']): Collection
    {
        return $this->newQuery()->get($columns);
    }

    public function find(int|string $id): ?Model
    {
        return $this->newQuery()->find($id);
    }

    public function findOrFail(int|string $id): Model
    {
        return $this->newQuery()->findOrFail($id);
    }

    public function create(array $data): Model
    {
        return $this->newQuery()->create($data);
    }

    public function update(Model $model, array $data): Model
    {
        $model->update($data);

        return $model->refresh();
    }

    public function delete(Model $model): bool
    {
        return (bool) $model->delete();
    }

    public function restore(Model $model): bool
    {
        if (! in_array(SoftDeletes::class, class_uses_recursive($model), true)) {
            return false;
        }

        return (bool) $model->restore();
    }

    public function forceDelete(Model $model): bool
    {
        if (! in_array(SoftDeletes::class, class_uses_recursive($model), true)) {
            return (bool) $model->delete();
        }

        return (bool) $model->forceDelete();
    }

    public function findTrashedOrFail(int|string $id): Model
    {
        return $this->newQuery()->onlyTrashed()->findOrFail($id);
    }
}
