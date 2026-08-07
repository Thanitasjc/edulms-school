<?php

namespace Modules\Blog\Database\Seeders;

use Illuminate\Database\Seeder;
use Modules\Blog\Domain\Models\BlogPost;
use Modules\Company\Domain\Models\Company;
use Modules\ModuleRegistry\Application\Services\ModuleRegistryService;
use Modules\ModuleRegistry\Domain\Models\Module;

class BlogSeeder extends Seeder
{
    public function run(): void
    {
        app(ModuleRegistryService::class)->syncFromConfig();

        $company = Company::query()->where('slug', 'demo-academy')->first()
            ?? Company::query()->first();

        if ($company === null) {
            return;
        }

        $module = Module::query()->where('key', 'blog')->first();
        if ($module) {
            $module->update(['is_enabled' => true]);
            $module->companies()->syncWithoutDetaching([
                $company->id => ['is_enabled' => true],
            ]);
        }

        $posts = [
            [
                'title' => 'How to Build an Effective Online Learning Program',
                'slug' => 'build-effective-online-learning-program',
                'excerpt' => 'Practical steps for schools and academies launching blended or fully online courses.',
                'body' => 'Online learning succeeds when institutions combine clear outcomes, engaging content, and measurable progress. Start by defining learner personas, map curriculum to skills, and publish in small iterations. Use analytics to spot drop-off points and refine lessons over time.',
                'cover_url' => 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80',
                'author_name' => 'Demo Academy Team',
                'status' => 'published',
                'published_at' => now()->subDays(7),
            ],
            [
                'title' => '5 Tips for Engaging Learners in Digital Classrooms',
                'slug' => 'tips-engaging-learners-digital-classrooms',
                'excerpt' => 'Keep students motivated with interactive content, progress tracking, and community.',
                'body' => 'Engagement improves when learners see progress and receive timely feedback. Mix short videos with quizzes, celebrate milestones, and create discussion prompts. Instructors should review completion data weekly and adjust pacing or support where needed.',
                'cover_url' => 'https://images.unsplash.com/photo-1427504490302-d9a1a7a7a1e8?auto=format&fit=crop&w=1200&q=80',
                'author_name' => 'Demo Academy Team',
                'status' => 'published',
                'published_at' => now()->subDays(3),
            ],
        ];

        foreach ($posts as $post) {
            BlogPost::withoutGlobalScope('company')->updateOrCreate(
                ['company_id' => $company->id, 'slug' => $post['slug']],
                array_merge($post, ['company_id' => $company->id])
            );
        }
    }
}
