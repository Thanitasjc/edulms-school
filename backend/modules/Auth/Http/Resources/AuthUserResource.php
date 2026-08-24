<?php

namespace Modules\Auth\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Modules\Company\Http\Resources\CompanyResource;

/** @mixin \App\Models\User */
class AuthUserResource extends JsonResource
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
            'current_company' => $this->whenLoaded('currentCompany', fn () => new CompanyResource($this->currentCompany)),
            'companies' => CompanyResource::collection($this->whenLoaded('companies')),
            'roles' => $this->getRoleNames()->values()->all(),
            'permissions' => $this->getAllPermissions()->pluck('name')->values()->all(),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
