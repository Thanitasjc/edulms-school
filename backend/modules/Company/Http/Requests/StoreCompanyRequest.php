<?php

namespace Modules\Company\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreCompanyRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('company.create') || $this->user()?->is_super_admin === true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255', 'alpha_dash', Rule::unique('companies', 'slug')],
            'domain' => ['nullable', 'string', 'max:255', Rule::unique('companies', 'domain')],
            'email' => ['nullable', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:50'],
            'logo_path' => ['nullable', 'string', 'max:500'],
            'timezone' => ['nullable', 'timezone'],
            'locale' => ['nullable', 'string', 'max:10'],
            'status' => ['nullable', Rule::in(['active', 'inactive', 'suspended'])],
            'settings' => ['nullable', 'array'],
        ];
    }
}
