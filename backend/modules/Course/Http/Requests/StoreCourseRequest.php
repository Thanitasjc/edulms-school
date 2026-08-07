<?php

namespace Modules\Course\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreCourseRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('course.create') || $this->user()?->is_super_admin === true;
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255', 'alpha_dash'],
            'category' => ['nullable', 'string', 'max:100'],
            'summary' => ['nullable', 'string'],
            'description' => ['nullable', 'string'],
            'curriculum' => ['nullable', 'array'],
            'curriculum.summary' => ['nullable', 'string'],
            'curriculum.sections' => ['nullable', 'array'],
            'curriculum.sections.*.title' => ['required_with:curriculum.sections', 'string', 'max:255'],
            'curriculum.sections.*.lessons' => ['nullable', 'array'],
            'curriculum.sections.*.lessons.*.title' => ['required_with:curriculum.sections.*.lessons', 'string', 'max:255'],
            'curriculum.sections.*.lessons.*.duration' => ['nullable', 'string', 'max:50'],
            'curriculum.sections.*.lessons.*.video_type' => ['nullable', Rule::in(['youtube', 'mp4'])],
            'curriculum.sections.*.lessons.*.video_url' => ['nullable', 'string', 'max:1000'],
            'curriculum.sections.*.lessons.*.is_preview' => ['nullable', 'boolean'],
            'thumbnail_url' => ['nullable', 'string', 'max:500'],
            'lessons_count' => ['nullable', 'integer', 'min:0'],
            'students_count' => ['nullable', 'integer', 'min:0'],
            'duration_hours' => ['nullable', 'integer', 'min:0'],
            'duration_weeks' => ['nullable', 'integer', 'min:0'],
            'skill_level' => ['nullable', 'string', 'max:100'],
            'language' => ['nullable', 'string', 'max:100'],
            'pass_percentage' => ['nullable', 'integer', 'min:0', 'max:100'],
            'deadline' => ['nullable', 'date'],
            'price' => ['nullable', 'numeric', 'min:0'],
            'sale_price' => ['nullable', 'numeric', 'min:0'],
            'is_free' => ['nullable', 'boolean'],
            'instructor_id' => ['nullable', 'integer', 'exists:instructors,id'],
            'instructor_name' => ['nullable', 'string', 'max:255'],
            'instructor_title' => ['nullable', 'string', 'max:255'],
            'instructor_avatar_url' => ['nullable', 'string', 'max:500'],
            'instructor_bio' => ['nullable', 'string'],
            'rating' => ['nullable', 'numeric', 'min:0', 'max:5'],
            'reviews_count' => ['nullable', 'integer', 'min:0'],
            'is_trending' => ['nullable', 'boolean'],
            'is_featured' => ['nullable', 'boolean'],
            'is_popular' => ['nullable', 'boolean'],
            'status' => ['nullable', Rule::in(['draft', 'published', 'archived'])],
            'published_at' => ['nullable', 'date'],
        ];
    }
}
