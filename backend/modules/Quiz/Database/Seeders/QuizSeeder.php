<?php

namespace Modules\Quiz\Database\Seeders;

use Illuminate\Database\Seeder;
use Modules\Company\Domain\Models\Company;
use Modules\Course\Domain\Models\Course;
use Modules\ModuleRegistry\Application\Services\ModuleRegistryService;
use Modules\ModuleRegistry\Domain\Models\Module;
use Modules\Quiz\Domain\Models\Quiz;
use Modules\Quiz\Domain\Models\QuizQuestion;

class QuizSeeder extends Seeder
{
    public function run(): void
    {
        app(ModuleRegistryService::class)->syncFromConfig();

        $company = Company::query()->where('slug', 'demo-academy')->first()
            ?? Company::query()->first();

        if ($company === null) {
            return;
        }

        $module = Module::query()->where('key', 'quiz')->first();
        if ($module) {
            $module->update(['is_enabled' => true]);
            $module->companies()->syncWithoutDetaching([
                $company->id => ['is_enabled' => true],
            ]);
        }

        $student = \App\Models\User::query()->where('email', 'student@demo-academy.test')->first();

        $enrolledCourseId = null;
        if ($student) {
            $enrolledCourseId = \Modules\Enrollment\Domain\Models\Enrollment::query()
                ->withoutGlobalScope('company')
                ->where('user_id', $student->id)
                ->where('status', 'active')
                ->value('course_id');
        }

        $courseQuery = Course::query()
            ->withoutGlobalScope('company')
            ->published()
            ->where('company_id', $company->id);

        $course = $enrolledCourseId
            ? (clone $courseQuery)->where('id', $enrolledCourseId)->first()
            : null;

        $course ??= $courseQuery->orderBy('id')->first();

        if ($course === null) {
            return;
        }

        // Ensure demo student can take the seeded quiz.
        if ($student) {
            try {
                app(\Modules\Enrollment\Application\Services\EnrollmentService::class)
                    ->purchase($student, (int) $course->id);
            } catch (\Throwable) {
                // already enrolled
            }
        }

        $quiz = Quiz::withoutGlobalScope('company')->updateOrCreate(
            [
                'company_id' => $company->id,
                'course_id' => $course->id,
                'lesson_key' => null,
            ],
            [
                'title' => 'Final Course Assessment',
                'description' => 'Complete this quiz to earn your certificate.',
                'pass_percentage' => 70,
                'status' => 'published',
            ]
        );

        $quiz->questions()->forceDelete();

        $questions = [
            [
                'question' => 'What does HTML stand for?',
                'options' => [
                    ['key' => 'a', 'text' => 'Hyper Text Markup Language'],
                    ['key' => 'b', 'text' => 'High Tech Modern Language'],
                    ['key' => 'c', 'text' => 'Home Tool Markup Language'],
                    ['key' => 'd', 'text' => 'Hyperlinks Text Mark Language'],
                ],
                'correct_option' => 'a',
                'sort_order' => 0,
            ],
            [
                'question' => 'Which tag is used for the largest heading in HTML?',
                'options' => [
                    ['key' => 'a', 'text' => '<h6>'],
                    ['key' => 'b', 'text' => '<heading>'],
                    ['key' => 'c', 'text' => '<h1>'],
                    ['key' => 'd', 'text' => '<head>'],
                ],
                'correct_option' => 'c',
                'sort_order' => 1,
            ],
            [
                'question' => 'CSS is used to style web pages.',
                'options' => [
                    ['key' => 'a', 'text' => 'True'],
                    ['key' => 'b', 'text' => 'False'],
                ],
                'correct_option' => 'a',
                'sort_order' => 2,
            ],
        ];

        foreach ($questions as $question) {
            QuizQuestion::query()->create(array_merge($question, [
                'quiz_id' => $quiz->id,
            ]));
        }
    }
}
