<?php

namespace Modules\Company\Application\Contracts;

use App\Core\Contracts\RepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Modules\Company\Domain\Models\Company;

interface CompanyRepositoryInterface extends RepositoryInterface
{
    public function paginateFiltered(callable $filter, int $perPage = 15): LengthAwarePaginator;

    public function findBySlug(string $slug): ?Company;
}
