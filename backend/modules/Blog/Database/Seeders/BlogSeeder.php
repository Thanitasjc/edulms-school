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
                'body' => "Online learning succeeds when institutions combine clear outcomes, engaging content, and measurable progress.\n\nStart by defining learner personas, map curriculum to skills, and publish in small iterations. Use analytics to spot drop-off points and refine lessons over time.",
                'cover_url' => 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80',
                'author_name' => 'Demo Academy Team',
                'status' => 'published',
                'published_at' => now()->subDays(7),
            ],
            [
                'title' => '5 Tips for Engaging Learners in Digital Classrooms',
                'slug' => 'tips-engaging-learners-digital-classrooms',
                'excerpt' => 'Keep students motivated with interactive content, progress tracking, and community.',
                'body' => "Engagement improves when learners see progress and receive timely feedback.\n\nMix short videos with quizzes, celebrate milestones, and create discussion prompts. Instructors should review completion data weekly and adjust pacing or support where needed.",
                'cover_url' => 'https://images.unsplash.com/photo-1427504490302-d9a1a7a7a1e8?auto=format&fit=crop&w=1200&q=80',
                'author_name' => 'Demo Academy Team',
                'status' => 'published',
                'published_at' => now()->subDays(3),
            ],
            [
                'title' => 'Education Week News and Views on Education Policy and Practice',
                'slug' => 'education-week-news-and-views',
                'excerpt' => 'A practical look at how policy shifts affect teaching, assessment, and school operations.',
                'body' => "Education policy shapes classrooms long before it reaches the news cycle.\n\nThis overview highlights how academies can adapt curriculum, communicate changes to parents, and keep instructors aligned when standards evolve.",
                'cover_url' => 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1200&q=80',
                'author_name' => 'Demo Academy Team',
                'status' => 'published',
                'published_at' => now()->subDays(5),
            ],
            [
                'title' => 'The Learning Network: Teaching and Learning With Modern Media',
                'slug' => 'the-learning-network',
                'excerpt' => 'Use news, stories, and discussion prompts to make lessons feel current and relevant.',
                'body' => "Media-rich lessons help learners connect abstract ideas to real events.\n\nBuild a weekly ritual: pick one story, frame a discussion question, and ask students to reflect in short written responses. Pair that with a micro-quiz to check understanding.",
                'cover_url' => 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1200&q=80',
                'author_name' => 'Demo Academy Team',
                'status' => 'published',
                'published_at' => now()->subDays(2),
            ],
            [
                'title' => 'Nothing is Impossible to Learn If You are Passionate About This Subject',
                'slug' => 'nothing-is-impossible-to-learn',
                'excerpt' => 'Motivation, deliberate practice, and feedback loops turn hard topics into reachable goals.',
                'body' => "Passion keeps learners going when content gets difficult.\n\nEncourage small wins, visible progress bars, and peer encouragement. Instructors should celebrate effort as well as outcomes so students stay resilient through advanced modules.",
                'cover_url' => 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=1200&q=80',
                'author_name' => 'Demo Academy Team',
                'status' => 'published',
                'published_at' => now()->subDay(),
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
