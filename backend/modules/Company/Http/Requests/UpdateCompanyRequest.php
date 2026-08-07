<?php

namespace Modules\Company\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateCompanyRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('company.update') || $this->user()?->is_super_admin === true;
    }

    public function rules(): array
    {
        $companyId = (int) $this->route('company');

        return [
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'slug' => ['sometimes', 'nullable', 'string', 'max:255', 'alpha_dash', Rule::unique('companies', 'slug')->ignore($companyId)],
            'domain' => ['sometimes', 'nullable', 'string', 'max:255', Rule::unique('companies', 'domain')->ignore($companyId)],
            'email' => ['sometimes', 'nullable', 'email', 'max:255'],
            'phone' => ['sometimes', 'nullable', 'string', 'max:50'],
            'logo_path' => ['sometimes', 'nullable', 'string', 'max:500'],
            'timezone' => ['sometimes', 'nullable', 'timezone'],
            'locale' => ['sometimes', 'nullable', 'string', 'max:10'],
            'status' => ['sometimes', 'nullable', Rule::in(['active', 'inactive', 'suspended'])],
            'settings' => ['sometimes', 'nullable', 'array'],
        ];
    }
}
