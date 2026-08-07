<?php

namespace App\Core\Concerns;

use App\Core\Support\TenantContext;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Modules\Company\Domain\Models\Company;

/**
 * @mixin Model
 */
trait BelongsToCompany
{
    public static function bootBelongsToCompany(): void
    {
        static::creating(function (Model $model): void {
            if (empty($model->getAttribute('company_id')) && TenantContext::id() !== null) {
                $model->setAttribute('company_id', TenantContext::id());
            }
        });

        static::addGlobalScope('company', function (Builder $builder): void {
            $companyId = TenantContext::id();

            if ($companyId === null || TenantContext::bypassed()) {
                return;
            }

            $builder->where(
                $builder->getModel()->getTable().'.company_id',
                $companyId
            );
        });
    }

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }
}
