<?php

namespace Modules\Course\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Modules\Enrollment\Application\Services\EnrollmentService;
use Modules\Instructor\Http\Resources\InstructorResource;

/** @mixin \Modules\Course\Domain\Models\Course */
class CourseResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $isEnrolled = $this->viewerIsEnrolled($request);
        $canWatch = $this->viewerCanWatch($request, $isEnrolled);

        return [
            'id' => $this->id,
            'company_id' => $this->company_id,
            'instructor_id' => $this->instructor_id,
            'title' => $this->title,
            'slug' => $this->slug,
            'category' => $this->category,
            'summary' => $this->summary,
            'description' => $this->description,
            'curriculum' => $this->transformCurriculum($canWatch),
            'can_watch_lessons' => $canWatch,
            'is_enrolled' => $isEnrolled,
            'thumbnail_url' => $this->thumbnail_url,
            'lessons_count' => (int) $this->lessons_count,
            'students_count' => (int) $this->students_count,
            'duration_hours' => (int) $this->duration_hours,
            'duration_weeks' => $this->duration_weeks !== null ? (int) $this->duration_weeks : null,
            'skill_level' => $this->skill_level,
            'language' => $this->language,
            'pass_percentage' => $this->pass_percentage !== null ? (int) $this->pass_percentage : null,
            'deadline' => $this->deadline?->toDateString(),
            'price' => (float) $this->price,
            'sale_price' => $this->sale_price !== null ? (float) $this->sale_price : null,
            'is_free' => (bool) $this->is_free,
            'instructor_name' => $this->relationLoaded('instructor') && $this->instructor
                ? $this->instructor->name
                : $this->instructor_name,
            'instructor_title' => $this->relationLoaded('instructor') && $this->instructor
                ? $this->instructor->role
                : $this->instructor_title,
            'instructor_avatar_url' => $this->relationLoaded('instructor') && $this->instructor
                ? $this->instructor->avatar_url
                : $this->instructor_avatar_url,
            'instructor_bio' => $this->resolveInstructorBio(),
            'instructor' => $this->whenLoaded('instructor', fn () => $this->instructor
                ? new InstructorResource($this->instructor)
                : null),
            'instructor_slug' => $this->relationLoaded('instructor') ? $this->instructor?->slug : null,
            'rating' => (float) $this->rating,
            'reviews_count' => (int) $this->reviews_count,
            'is_trending' => (bool) $this->is_trending,
            'is_featured' => (bool) $this->is_featured,
            'is_popular' => (bool) $this->is_popular,
            'status' => $this->status,
            'published_at' => $this->published_at?->toIso8601String(),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
            'deleted_at' => $this->deleted_at?->toIso8601String(),
        ];
    }

    private function resolveInstructorBio(): ?string
    {
        if ($this->relationLoaded('instructor') && $this->instructor) {
            $about = $this->instructor->about;
            if (is_array($about) && $about !== []) {
                return implode("\n\n", $about);
            }
        }

        return $this->instructor_bio;
    }

    private function viewerIsEnrolled(Request $request): bool
    {
        $user = $request->user();
        if ($user === null) {
            return false;
        }

        return app(EnrollmentService::class)->isUserEnrolled($user, (int) $this->id);
    }

    private function viewerCanWatch(Request $request, bool $isEnrolled): bool
    {
        $path = $request->path();
        $isPublic = str_contains($path, 'public/courses');

        if (! $isPublic) {
            return true;
        }

        if ((bool) $this->is_free || (float) $this->price <= 0) {
            return true;
        }

        return $isEnrolled;
    }

    /**
     * @return array{summary: ?string, sections: list<array<string, mixed>>}
     */
    private function transformCurriculum(bool $canWatch): array
    {
        $curriculum = is_array($this->curriculum)
            ? $this->curriculum
            : ['summary' => null, 'sections' => []];

        $sections = [];
        foreach ($curriculum['sections'] ?? [] as $section) {
            if (! is_array($section)) {
                continue;
            }

            $lessons = [];
            foreach ($section['lessons'] ?? [] as $lesson) {
                if (! is_array($lesson)) {
                    continue;
                }

                $isPreview = (bool) ($lesson['is_preview'] ?? false);
                $unlocked = $canWatch || $isPreview;
                $videoType = $lesson['video_type'] ?? null;
                $videoUrl = $lesson['video_url'] ?? null;

                $lessons[] = [
                    'title' => $lesson['title'] ?? '',
                    'duration' => $lesson['duration'] ?? null,
                    'video_type' => in_array($videoType, ['youtube', 'mp4'], true) ? $videoType : null,
                    'video_url' => $unlocked && is_string($videoUrl) && $videoUrl !== '' ? $videoUrl : null,
                    'is_preview' => $isPreview,
                    'is_locked' => ! $unlocked,
                ];
            }

            $sections[] = [
                'title' => $section['title'] ?? '',
                'lessons' => $lessons,
            ];
        }

        return [
            'summary' => $curriculum['summary'] ?? null,
            'sections' => $sections,
        ];
    }
}
