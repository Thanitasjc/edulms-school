<?php

namespace App\Core\Services;

use App\Core\Contracts\RepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;
use Throwable;

abstract class BaseService
{
    public function __construct(
        protected readonly RepositoryInterface $repository
    ) {}

    public function paginate(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        return $this->repository->paginate($filters, $perPage);
    }

    public function findOrFail(int|string $id): Model
    {
        return $this->repository->findOrFail($id);
    }

    /**
     * @throws Throwable
     */
    public function create(array $data): Model
    {
        return DB::transaction(function () use ($data): Model {
            $model = $this->repository->create($data);
            $this->afterCreate($model, $data);

            return $model;
        });
    }

    /**
     * @throws Throwable
     */
    public function update(int|string $id, array $data): Model
    {
        return DB::transaction(function () use ($id, $data): Model {
            $model = $this->repository->findOrFail($id);
            $model = $this->repository->update($model, $data);
            $this->afterUpdate($model, $data);

            return $model;
        });
    }

    /**
     * @throws Throwable
     */
    public function delete(int|string $id): bool
    {
        return DB::transaction(function () use ($id): bool {
            $model = $this->repository->findOrFail($id);
            $deleted = $this->repository->delete($model);
            $this->afterDelete($model);

            return $deleted;
        });
    }

    /**
     * @throws Throwable
     */
    public function restore(int|string $id): Model
    {
        return DB::transaction(function () use ($id): Model {
            $model = $this->repository->findTrashedOrFail($id);
            $this->repository->restore($model);

            return $model->refresh();
        });
    }

    protected function afterCreate(Model $model, array $data): void {}

    protected function afterUpdate(Model $model, array $data): void {}

    protected function afterDelete(Model $model): void {}
}
