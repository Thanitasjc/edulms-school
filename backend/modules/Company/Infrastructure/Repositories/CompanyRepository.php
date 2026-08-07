<?php

namespace Modules\Company\Infrastructure\Repositories;

use App\Core\Repositories\BaseRepository;
use App\Core\Support\QueryFilter;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Modules\Company\Application\Contracts\CompanyRepositoryInterface;
use Modules\Company\Domain\Models\Company;

class CompanyRepository extends BaseRepository implements CompanyRepositoryInterface
{
    public function __construct(Company $model)
    {
        parent::__construct($model);
    }

    protected function searchable(): array
    {
        return ['name', 'slug', 'email', 'domain'];
    }

    protected function filterable(): array
    {
        return ['status', 'locale', 'timezone'];
    }

    protected function sortable(): array
    {
        return ['id', 'name', 'slug', 'status', 'created_at', 'updated_at'];
    }

    public function paginateFiltered(callable $filter, int $perPage = 15): LengthAwarePaginator
    {
        $query = $this->newQuery();
        $filter($query);

        return $query->paginate($perPage);
    }

    public function findBySlug(string $slug): ?Company
    {
        /** @var Company|null $company */
        $company = $this->newQuery()->where('slug', $slug)->first();

        return $company;
    }

    public function applyRequestFilters(QueryFilter $queryFilter): LengthAwarePaginator
    {
        $query = $this->newQuery();
        $queryFilter->apply($query, $this->searchable(), $this->filterable(), $this->sortable());

        return $query->paginate($queryFilter->perPage());
    }
}
