<?php

namespace Modules\ModuleRegistry\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \Modules\ModuleRegistry\Domain\Models\Module */
class ModuleResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'key' => $this->key,
            'name' => $this->name,
            'description' => $this->description,
            'is_core' => (bool) $this->is_core,
            'is_enabled' => (bool) $this->is_enabled,
            'dependencies' => $this->dependencies ?? [],
            'sort_order' => $this->sort_order,
        ];
    }
}
