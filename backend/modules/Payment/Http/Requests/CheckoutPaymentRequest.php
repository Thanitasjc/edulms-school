<?php

namespace Modules\Payment\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CheckoutPaymentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'course_ids' => ['required', 'array', 'min:1'],
            'course_ids.*' => ['integer', 'exists:courses,id'],
        ];
    }
}
