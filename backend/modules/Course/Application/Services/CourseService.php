<?php

namespace Modules\Course\Application\Services;

use App\Core\Support\QueryFilter;
use App\Core\Support\TenantContext;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Modules\Course\Domain\Models\Course;
use Modules\Instructor\Domain\Models\Instructor;
use Throwable;

class CourseService
{
    public function listPublic(?string $tab = null, int $limit = 12): Collection
    {
        return Course::query()
            ->withoutGlobalScope('company')
            ->with('instructor')
            ->published()
            ->tab($tab)
            ->orderByDesc('is_featured')
            ->orderByDesc('students_count')
            ->orderByDesc('published_at')
            ->limit($limit)
            ->get();
    }

    public function paginatePublic(QueryFilter $queryFilter, ?string $tab = null): LengthAwarePaginator
    {
        $query = Course::query()
            ->withoutGlobalScope('company')
            ->with('instructor')
            ->published()
            ->tab($tab);

        $queryFilter->apply(
            $query,
            searchable: ['title', 'category', 'instructor_name', 'summary'],
            filterable: ['category', 'is_free'],
            sortable: ['id', 'title', 'price', 'rating', 'students_count', 'published_at', 'created_at']
        );

        return $query->paginate($queryFilter->perPage());
    }

    public function findPublishedBySlug(string $slug): Course
    {
        /** @var Course $course */
        $course = Course::query()
            ->withoutGlobalScope('company')
            ->published()
            ->where('slug', $slug)
            ->with('instructor')
            ->firstOrFail();

        return $course;
    }

    public function listAdmin(QueryFilter $queryFilter): LengthAwarePaginator
    {
        $query = Course::query();

        $queryFilter->apply(
            $query,
            searchable: ['title', 'slug', 'category', 'instructor_name'],
            filterable: ['status', 'category', 'is_featured', 'is_trending', 'is_popular'],
            sortable: ['id', 'title', 'status', 'price', 'created_at', 'updated_at']
        );

        return $query->paginate($queryFilter->perPage());
    }

    public function findAdmin(int $id): Course
    {
        /** @var Course $course */
        $course = Course::query()->findOrFail($id);

        return $course;
    }

    /**
     * @throws Throwable
     */
    public function create(array $data): Course
    {
        return DB::transaction(function () use ($data): Course {
            $companyId = $data['company_id'] ?? TenantContext::id();
            $data['slug'] = $this->uniqueSlug($data['slug'] ?? $data['title'], $companyId);
            $data['curriculum'] = $this->normalizeCurriculum($data['curriculum'] ?? null);
            $data['is_free'] = array_key_exists('is_free', $data)
                ? (bool) $data['is_free']
                : ((float) ($data['price'] ?? 0) <= 0);

            if (! array_key_exists('lessons_count', $data) || $data['lessons_count'] === null) {
                $data['lessons_count'] = $this->countLessons($data['curriculum']);
            } else {
                $data['lessons_count'] = $this->countLessons($data['curriculum']) ?: (int) $data['lessons_count'];
            }

            if (($data['status'] ?? 'draft') === 'published' && empty($data['published_at'])) {
                $data['published_at'] = now();
            }

            $data = $this->syncInstructorSnapshot($data);

            /** @var Course $course */
            $course = Course::query()->create($data);

            return $course;
        });
    }

    /**
     * @throws Throwable
     */
    public function update(int $id, array $data): Course
    {
        return DB::transaction(function () use ($id, $data): Course {
            $course = $this->findAdmin($id);

            if (array_key_exists('slug', $data) || array_key_exists('title', $data)) {
                $slugSource = $data['slug'] ?? $data['title'] ?? $course->title;
                $data['slug'] = $this->uniqueSlug((string) $slugSource, (int) $course->company_id, $course->id);
            }

            if (array_key_exists('curriculum', $data)) {
                $data['curriculum'] = $this->normalizeCurriculum($data['curriculum']);
                $data['lessons_count'] = $this->countLessons($data['curriculum']);
            }

            if (array_key_exists('is_free', $data)) {
                $data['is_free'] = (bool) $data['is_free'];
            } elseif (array_key_exists('price', $data)) {
                $data['is_free'] = ((float) $data['price']) <= 0;
            }

            if (($data['status'] ?? $course->status) === 'published' && empty($data['published_at']) && $course->published_at === null) {
                $data['published_at'] = now();
            }

            $data = $this->syncInstructorSnapshot($data, $course);

            $course->update($data);

            return $course->refresh();
        });
    }

    /**
     * @throws Throwable
     */
    public function delete(int $id): bool
    {
        return DB::transaction(function () use ($id): bool {
            $course = $this->findAdmin($id);

            return (bool) $course->delete();
        });
    }

    /**
     * @throws Throwable
     */
    public function restore(int $id): Course
    {
        return DB::transaction(function () use ($id): Course {
            /** @var Course $course */
            $course = Course::withTrashed()->findOrFail($id);
            $course->restore();

            return $course->refresh();
        });
    }

    /**
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    private function syncInstructorSnapshot(array $data, ?Course $course = null): array
    {
        if (! array_key_exists('instructor_id', $data)) {
            return $data;
        }

        if ($data['instructor_id'] === null) {
            return $data;
        }

        /** @var Instructor|null $instructor */
        $instructor = Instructor::query()
            ->withoutGlobalScope('company')
            ->find($data['instructor_id']);

        if ($instructor === null) {
            return $data;
        }

        $data['instructor_name'] = $data['instructor_name'] ?? $instructor->name;
        $data['instructor_title'] = $data['instructor_title'] ?? $instructor->role;
        $data['instructor_avatar_url'] = $data['instructor_avatar_url'] ?? $instructor->avatar_url;
        $data['instructor_bio'] = $data['instructor_bio']
            ?? (is_array($instructor->about) ? implode("\n\n", $instructor->about) : $instructor->about);

        return $data;
    }

    private function uniqueSlug(string $value, ?int $companyId, ?int $ignoreId = null): string
    {
        $base = Str::slug($value);
        $slug = $base !== '' ? $base : 'course';
        $counter = 1;

        while (
            Course::withTrashed()
                ->withoutGlobalScope('company')
                ->where('company_id', $companyId)
                ->where('slug', $slug)
                ->when($ignoreId, fn ($query) => $query->where('id', '!=', $ignoreId))
                ->exists()
        ) {
            $slug = $base.'-'.$counter;
            $counter++;
        }

        return $slug;
    }

    /**
     * @param  mixed  $curriculum
     * @return array{summary: ?string, sections: list<array{title: string, lessons: list<array{title: string, duration: ?string}>}>}
     */
    private function normalizeCurriculum(mixed $curriculum): array
    {
        if (! is_array($curriculum)) {
            return ['summary' => null, 'sections' => []];
        }

        $sections = [];
        foreach ($curriculum['sections'] ?? [] as $section) {
            if (! is_array($section)) {
                continue;
            }

            $title = trim((string) ($section['title'] ?? ''));
            if ($title === '') {
                continue;
            }

            $lessons = [];
            foreach ($section['lessons'] ?? [] as $lesson) {
                if (! is_array($lesson)) {
                    continue;
                }

                $lessonTitle = trim((string) ($lesson['title'] ?? ''));
                if ($lessonTitle === '') {
                    continue;
                }

                $duration = trim((string) ($lesson['duration'] ?? ''));
                $videoType = $lesson['video_type'] ?? null;
                $videoType = in_array($videoType, ['youtube', 'mp4'], true) ? $videoType : null;
                $videoUrl = trim((string) ($lesson['video_url'] ?? ''));

                $lessons[] = [
                    'title' => $lessonTitle,
                    'duration' => $duration !== '' ? $duration : null,
                    'video_type' => $videoType,
                    'video_url' => $videoUrl !== '' ? $videoUrl : null,
                    'is_preview' => (bool) ($lesson['is_preview'] ?? false),
                ];
            }

            $sections[] = [
                'title' => $title,
                'lessons' => $lessons,
            ];
        }

        $summary = trim((string) ($curriculum['summary'] ?? ''));

        return [
            'summary' => $summary !== '' ? $summary : null,
            'sections' => $sections,
        ];
    }

    /**
     * @param  array{sections?: list<array{lessons?: list<mixed>}>}|null  $curriculum
     */
    private function countLessons(?array $curriculum): int
    {
        $count = 0;
        foreach ($curriculum['sections'] ?? [] as $section) {
            $count += count($section['lessons'] ?? []);
        }

        return $count;
    }
}
