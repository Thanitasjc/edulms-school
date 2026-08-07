<?php

namespace Modules\Course\Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Modules\Company\Domain\Models\Company;
use Modules\Course\Application\Services\CourseReviewService;
use Modules\Course\Domain\Models\Course;
use Modules\Course\Domain\Models\CourseReview;

class CourseReviewSeeder extends Seeder
{
    public function run(): void
    {
        $company = Company::query()->where('slug', 'demo-academy')->first()
            ?? Company::query()->first();

        if ($company === null) {
            return;
        }

        $admin = User::query()->where('email', 'admin@demo-academy.test')->first();
        $student = User::query()->where('email', 'student@demo-academy.test')->first();
        $super = User::query()->where('email', 'superadmin@lms.test')->first();

        $reviewers = array_values(array_filter([$admin, $student, $super]));
        if ($reviewers === []) {
            return;
        }

        $courses = Course::query()
            ->withoutGlobalScope('company')
            ->where('company_id', $company->id)
            ->published()
            ->get();

        $comments = [
            ['rating' => 5, 'title' => 'Excellent course', 'body' => 'Clear lessons and practical examples. Highly recommended.'],
            ['rating' => 4, 'title' => 'Very useful', 'body' => 'Good pacing and solid curriculum. Would love more advanced labs.'],
            ['rating' => 5, 'title' => 'Worth it', 'body' => 'The preview videos sold me, and the full content delivered.'],
        ];

        $reviewService = app(CourseReviewService::class);

        foreach ($courses as $index => $course) {
            $payload = $comments[$index % count($comments)];
            $user = $reviewers[$index % count($reviewers)];

            $exists = CourseReview::withTrashed()
                ->withoutGlobalScope('company')
                ->where('course_id', $course->id)
                ->where('user_id', $user->id)
                ->exists();

            if ($exists) {
                continue;
            }

            try {
                $reviewService->createAdmin([
                    'course_id' => $course->id,
                    'user_id' => $user->id,
                    'rating' => $payload['rating'],
                    'title' => $payload['title'],
                    'body' => $payload['body'],
                    'status' => 'approved',
                ]);
            } catch (\Throwable) {
                // skip duplicates / race
            }
        }
    }
}
