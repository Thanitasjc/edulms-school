<?php

namespace Modules\User\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Modules\Company\Http\Resources\CompanyResource;

/** @mixin \App\Models\User */
class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'phone' => $this->phone,
            'avatar_path' => $this->avatar_path,
            'status' => $this->status,
            'is_super_admin' => (bool) $this->is_super_admin,
            'current_company_id' => $this->current_company_id,
            'roles' => $this->whenLoaded('roles', fn () => $this->getRoleNames()),
            'companies' => CompanyResource::collection($this->whenLoaded('companies')),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
            'deleted_at' => $this->deleted_at?->toIso8601String(),
        ];
    }
}
