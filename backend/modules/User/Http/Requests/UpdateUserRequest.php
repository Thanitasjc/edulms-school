<?php

namespace Modules\User\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

class UpdateUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('user.update') || $this->user()?->is_super_admin === true;
    }

    public function rules(): array
    {
        $userId = (int) $this->route('user');

        return [
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'email' => ['sometimes', 'required', 'email', 'max:255', Rule::unique('users', 'email')->ignore($userId)],
            'phone' => ['sometimes', 'nullable', 'string', 'max:50'],
            'password' => ['sometimes', 'nullable', 'confirmed', Password::defaults()],
            'status' => ['sometimes', 'nullable', Rule::in(['active', 'inactive', 'suspended'])],
            'roles' => ['sometimes', 'nullable', 'array'],
            'roles.*' => ['string', 'exists:roles,name'],
            'company_ids' => ['sometimes', 'nullable', 'array'],
            'company_ids.*' => ['integer', 'exists:companies,id'],
            'current_company_id' => ['sometimes', 'nullable', 'integer', 'exists:companies,id'],
        ];
    }
}
