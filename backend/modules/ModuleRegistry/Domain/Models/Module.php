<?php

namespace Modules\ModuleRegistry\Domain\Models;

use App\Core\Models\BaseModel;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Modules\Company\Domain\Models\Company;

class Module extends BaseModel
{
    protected $table = 'modules';

    protected $fillable = [
        'key',
        'name',
        'description',
        'is_core',
        'is_enabled',
        'dependencies',
        'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'is_core' => 'boolean',
            'is_enabled' => 'boolean',
            'dependencies' => 'array',
        ];
    }

    public function companies(): BelongsToMany
    {
        return $this->belongsToMany(Company::class, 'company_modules')
            ->withPivot(['is_enabled'])
            ->withTimestamps();
    }
}
