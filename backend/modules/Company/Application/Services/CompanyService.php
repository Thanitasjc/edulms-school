<?php

namespace Modules\Company\Application\Services;

use App\Core\Services\BaseService;
use App\Core\Support\QueryFilter;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;
use Modules\Company\Application\Contracts\CompanyRepositoryInterface;
use Modules\Company\Domain\Models\Company;
use Modules\Company\Infrastructure\Repositories\CompanyRepository;

class CompanyService extends BaseService
{
    public function __construct(
        private readonly CompanyRepositoryInterface $companyRepository
    ) {
        parent::__construct($companyRepository);
    }

    public function list(QueryFilter $queryFilter): LengthAwarePaginator
    {
        /** @var CompanyRepository $repository */
        $repository = $this->companyRepository;

        return $repository->applyRequestFilters($queryFilter);
    }

    public function create(array $data): Model
    {
        $data['slug'] = $this->uniqueSlug($data['slug'] ?? $data['name']);

        return parent::create($data);
    }

    public function update(int|string $id, array $data): Model
    {
        if (isset($data['slug'])) {
            $data['slug'] = $this->uniqueSlug($data['slug'], (int) $id);
        } elseif (isset($data['name'])) {
            $existing = $this->companyRepository->findOrFail($id);
            if ($existing->name !== $data['name']) {
                $data['slug'] = $this->uniqueSlug($data['name'], (int) $id);
            }
        }

        return parent::update($id, $data);
    }

    private function uniqueSlug(string $value, ?int $ignoreId = null): string
    {
        $base = Str::slug($value);
        $slug = $base;
        $counter = 1;

        while (
            Company::withTrashed()
                ->where('slug', $slug)
                ->when($ignoreId, fn ($q) => $q->where('id', '!=', $ignoreId))
                ->exists()
        ) {
            $slug = $base.'-'.$counter;
            $counter++;
        }

        return $slug;
    }
}
