<?php

namespace Modules\Cms\Database\Seeders;

use Illuminate\Database\Seeder;
use Modules\Cms\Domain\Models\Category;
use Modules\Cms\Domain\Models\HeroSlide;
use Modules\Company\Domain\Models\Company;
use Modules\ModuleRegistry\Application\Services\ModuleRegistryService;
use Modules\ModuleRegistry\Domain\Models\Module;

class CmsSeeder extends Seeder
{
    public function run(): void
    {
        app(ModuleRegistryService::class)->syncFromConfig();

        $company = Company::query()->where('slug', 'demo-academy')->first()
            ?? Company::query()->first();

        if ($company === null) {
            return;
        }

        $module = Module::query()->where('key', 'cms')->first();
        if ($module) {
            $module->update(['is_enabled' => true]);
            $module->companies()->syncWithoutDetaching([
                $company->id => ['is_enabled' => true],
            ]);
        }

        $categories = [
            [
                'name' => 'Graphic Design',
                'slug' => 'graphic-design',
                'icon' => 'pen-square',
                'accent' => 'bg-sky-50 text-sky-600 dark:bg-sky-950/40 dark:text-sky-300',
                'sort_order' => 1,
            ],
            [
                'name' => 'IT & Software',
                'slug' => 'web',
                'icon' => 'layout-grid',
                'accent' => 'bg-violet-50 text-violet-600 dark:bg-violet-950/40 dark:text-violet-300',
                'sort_order' => 2,
            ],
            [
                'name' => 'Art & Design',
                'slug' => 'art-design',
                'icon' => 'pen-line',
                'accent' => 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-300',
                'sort_order' => 3,
            ],
            [
                'name' => 'Digital Marketing',
                'slug' => 'digital-marketing',
                'icon' => 'bar-chart-3',
                'accent' => 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-300',
                'sort_order' => 4,
            ],
            [
                'name' => 'Language',
                'slug' => 'language',
                'icon' => 'languages',
                'accent' => 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-300',
                'sort_order' => 5,
            ],
            [
                'name' => 'Mobile App',
                'slug' => 'mobile-app',
                'icon' => 'smartphone',
                'accent' => 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-300',
                'sort_order' => 6,
            ],
        ];

        foreach ($categories as $category) {
            Category::withoutGlobalScope('company')->updateOrCreate(
                ['company_id' => $company->id, 'slug' => $category['slug']],
                array_merge($category, [
                    'company_id' => $company->id,
                    'is_featured' => true,
                    'status' => 'published',
                ])
            );
        }

        $slides = [
            [
                'subtitle' => 'New journey for your academy',
                'title' => 'Welcome to Our',
                'title_accent' => 'Learning Platform',
                'description' => 'Build curriculum, enroll learners, and deliver courses across schools, universities, and enterprise academies.',
                'cta_label' => 'Learn More',
                'cta_href' => '/about',
                'image_url' => 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=2400&q=80',
                'sort_order' => 1,
            ],
            [
                'subtitle' => 'Online education that scales',
                'title' => 'Choose Online',
                'title_accent' => 'Video Courses',
                'description' => 'Publish structured lessons, track progress, and help learners complete programs with confidence.',
                'cta_label' => 'Explore Courses',
                'cta_href' => '/courses',
                'image_url' => 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=2400&q=80',
                'sort_order' => 2,
            ],
            [
                'subtitle' => 'Teach with clarity and impact',
                'title' => 'Empower Your',
                'title_accent' => 'Instructors',
                'description' => 'Give teachers a modern workspace to create content, assess learners, and issue certificates.',
                'cta_label' => 'Get Started',
                'cta_href' => '/register',
                'image_url' => 'https://images.unsplash.com/photo-1427504490302-d9a1a7a7a1e8?auto=format&fit=crop&w=2400&q=80',
                'sort_order' => 3,
            ],
        ];

        foreach ($slides as $slide) {
            HeroSlide::withoutGlobalScope('company')->updateOrCreate(
                [
                    'company_id' => $company->id,
                    'title' => $slide['title'],
                    'title_accent' => $slide['title_accent'],
                ],
                array_merge($slide, [
                    'company_id' => $company->id,
                    'is_active' => true,
                ])
            );
        }
    }
}
