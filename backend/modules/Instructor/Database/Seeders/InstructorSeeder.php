<?php

namespace Modules\Instructor\Database\Seeders;

use Illuminate\Database\Seeder;
use Modules\Company\Domain\Models\Company;
use Modules\Instructor\Domain\Models\Instructor;
use Modules\ModuleRegistry\Application\Services\ModuleRegistryService;
use Modules\ModuleRegistry\Domain\Models\Module;

class InstructorSeeder extends Seeder
{
    public function run(): void
    {
        app(ModuleRegistryService::class)->syncFromConfig();

        $company = Company::query()->where('slug', 'demo-academy')->first()
            ?? Company::query()->first();

        if ($company === null) {
            return;
        }

        $module = Module::query()->where('key', 'instructor')->first();
        if ($module) {
            $module->update(['is_enabled' => true]);
            $module->companies()->syncWithoutDetaching([
                $company->id => ['is_enabled' => true],
            ]);
        }

        $samples = [
            [
                'name' => 'Parsley Montana',
                'slug' => 'parsley-montana',
                'role' => 'Lead Teacher',
                'subtitle' => 'Lead Teacher, Researcher',
                'avatar_url' => 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80',
                'rating' => 5,
                'reviews_count' => 3,
                'about' => [
                    'Lorem ipsum dolor sit amet, consectetur elit sed do eius mod tempor incidid labore dolore magna aliqua.',
                    'doloremque laudantium totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto.',
                ],
                'address' => 'Hilton Conference Centre',
                'email' => 'parsley@demo-academy.test',
                'phone' => '+123 548 6458 50',
                'skill_labels' => ['Teaching', 'Curriculum', 'Research'],
            ],
            [
                'name' => 'Lana Pierce',
                'slug' => 'lana-pierce',
                'role' => 'Science Teacher',
                'subtitle' => 'Science Teacher, STEM Mentor',
                'avatar_url' => 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=800&q=80',
                'rating' => 4.9,
                'reviews_count' => 12,
                'about' => [
                    'Lana helps learners build strong foundations in science through practical experiments and clear explanations.',
                    'She focuses on curiosity-driven learning and real-world STEM applications.',
                ],
                'address' => 'Science Wing, Demo Academy',
                'email' => 'lana@demo-academy.test',
                'phone' => '+123 548 6458 51',
                'skill_labels' => ['Biology', 'Chemistry', 'STEM'],
            ],
            [
                'name' => 'Marcus Lin',
                'slug' => 'marcus-lin',
                'role' => 'Math Instructor',
                'subtitle' => 'Math Instructor, Problem Solver',
                'avatar_url' => 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=800&q=80',
                'rating' => 4.8,
                'reviews_count' => 18,
                'about' => [
                    'Marcus specializes in making advanced mathematics approachable for every learner.',
                    'His courses emphasize step-by-step reasoning and confident problem solving.',
                ],
                'address' => 'Math Lab, Demo Academy',
                'email' => 'marcus@demo-academy.test',
                'phone' => '+123 548 6458 52',
                'skill_labels' => ['Algebra', 'Calculus', 'Statistics'],
            ],
            [
                'name' => 'Eric Widget',
                'slug' => 'eric-widget',
                'role' => 'Web Instructor',
                'subtitle' => 'Web Instructor, Frontend Mentor',
                'avatar_url' => 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80',
                'rating' => 4.9,
                'reviews_count' => 31,
                'about' => [
                    'Eric teaches modern web development with practical projects.',
                    'His courses focus on JavaScript, UX, and shipping real products.',
                ],
                'address' => 'Tech Lab, Demo Academy',
                'email' => 'eric@demo-academy.test',
                'phone' => '+123 548 6458 56',
                'skill_labels' => ['JavaScript', 'React', 'UX'],
            ],
            [
                'name' => 'Hanson Deck',
                'slug' => 'hanson-deck',
                'role' => 'Product Coach',
                'subtitle' => 'Product Coach, Design Systems',
                'avatar_url' => 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
                'rating' => 4.7,
                'reviews_count' => 19,
                'about' => [
                    'Hanson mentors teams on product thinking and design systems.',
                    'Students learn to ship polished interfaces with confidence.',
                ],
                'address' => 'Studio Hall, Demo Academy',
                'email' => 'hanson@demo-academy.test',
                'phone' => '+123 548 6458 57',
                'skill_labels' => ['Product', 'Design', 'Systems'],
            ],
        ];

        foreach ($samples as $sample) {
            Instructor::query()->withoutGlobalScope('company')->updateOrCreate(
                [
                    'company_id' => $company->id,
                    'slug' => $sample['slug'],
                ],
                array_merge($sample, [
                    'company_id' => $company->id,
                    'status' => 'published',
                ])
            );
        }
    }
}
