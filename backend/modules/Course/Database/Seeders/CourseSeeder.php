<?php

namespace Modules\Course\Database\Seeders;

use Illuminate\Database\Seeder;
use Modules\Company\Domain\Models\Company;
use Modules\Course\Domain\Models\Course;
use Modules\Instructor\Domain\Models\Instructor;
use Modules\ModuleRegistry\Application\Services\ModuleRegistryService;
use Modules\ModuleRegistry\Domain\Models\Module;

class CourseSeeder extends Seeder
{
    public function run(): void
    {
        app(ModuleRegistryService::class)->syncFromConfig();

        $company = Company::query()->where('slug', 'demo-academy')->first()
            ?? Company::query()->first();

        if ($company === null) {
            return;
        }

        $courseModule = Module::query()->where('key', 'course')->first();
        if ($courseModule) {
            $courseModule->update(['is_enabled' => true]);
            $courseModule->companies()->syncWithoutDetaching([
                $company->id => ['is_enabled' => true],
            ]);
        }

        $samples = [
            [
                'title' => 'The Complete JavaScript Course From Zero to Expert!',
                'slug' => 'the-complete-javascript-course-from-zero-to-expert',
                'category' => 'art-design',
                'summary' => 'เรียนรู้ JavaScript ตั้งแต่พื้นฐานจนถึงระดับมืออาชีพ',
                'thumbnail_url' => 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80',
                'lessons_count' => 23,
                'students_count' => 50,
                'duration_hours' => 23,
                'price' => 130,
                'sale_price' => 86,
                'is_free' => true,
                'instructor_name' => 'Eric Widget',
                'instructor_avatar_url' => 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80',
                'rating' => 5,
                'reviews_count' => 25,
                'is_trending' => true,
                'is_featured' => true,
                'is_popular' => true,
            ],
            [
                'title' => 'High-Quality Online Course Access For Everyone',
                'slug' => 'high-quality-online-course-access-for-everyone',
                'category' => 'graphic-design',
                'summary' => 'คอร์สออนไลน์คุณภาพสูงสำหรับทุกคน',
                'thumbnail_url' => 'https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?auto=format&fit=crop&w=1200&q=80',
                'lessons_count' => 34,
                'students_count' => 47,
                'duration_hours' => 23,
                'price' => 100,
                'sale_price' => 67,
                'is_free' => true,
                'instructor_name' => 'Hanson Deck',
                'instructor_avatar_url' => 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
                'rating' => 5,
                'reviews_count' => 25,
                'is_trending' => true,
                'is_featured' => true,
                'is_popular' => false,
            ],
            [
                'title' => 'Access Premium Content With Online Courses',
                'slug' => 'access-premium-content-with-online-courses',
                'category' => 'art-design',
                'summary' => 'เข้าถึงคอนเทนต์พรีเมียมผ่านคอร์สออนไลน์',
                'thumbnail_url' => 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=1200&q=80',
                'lessons_count' => 23,
                'students_count' => 50,
                'duration_hours' => 23,
                'price' => 130,
                'sale_price' => 86,
                'is_free' => true,
                'instructor_name' => 'Eric Widget',
                'instructor_avatar_url' => 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80',
                'rating' => 5,
                'reviews_count' => 25,
                'is_trending' => false,
                'is_featured' => true,
                'is_popular' => true,
            ],
            [
                'title' => 'Modern Web Development Bootcamp',
                'slug' => 'modern-web-development-bootcamp',
                'category' => 'web',
                'summary' => 'สร้างเว็บแอปพลิเคชันสมัยใหม่ด้วยเครื่องมือมาตรฐานอุตสาหกรรม',
                'thumbnail_url' => 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80',
                'lessons_count' => 48,
                'students_count' => 120,
                'duration_hours' => 40,
                'price' => 199,
                'sale_price' => 149,
                'is_free' => false,
                'instructor_name' => 'Hanson Deck',
                'instructor_avatar_url' => 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
                'rating' => 4.8,
                'reviews_count' => 42,
                'is_trending' => true,
                'is_featured' => false,
                'is_popular' => true,
            ],
            [
                'title' => 'UI/UX Design Fundamentals',
                'slug' => 'ui-ux-design-fundamentals',
                'category' => 'graphic-design',
                'summary' => 'พื้นฐานการออกแบบประสบการณ์ผู้ใช้และส่วนติดต่อผู้ใช้',
                'thumbnail_url' => 'https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&w=1200&q=80',
                'lessons_count' => 28,
                'students_count' => 86,
                'duration_hours' => 18,
                'price' => 0,
                'sale_price' => null,
                'is_free' => true,
                'instructor_name' => 'Eric Widget',
                'instructor_avatar_url' => 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80',
                'rating' => 4.9,
                'reviews_count' => 31,
                'is_trending' => false,
                'is_featured' => true,
                'is_popular' => true,
            ],
            [
                'title' => 'Digital Marketing Mastery',
                'slug' => 'digital-marketing-mastery',
                'category' => 'web',
                'summary' => 'กลยุทธ์การตลาดดิจิทัลสำหรับแบรนด์และการเติบโตของธุรกิจ',
                'thumbnail_url' => 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80',
                'lessons_count' => 31,
                'students_count' => 75,
                'duration_hours' => 22,
                'price' => 120,
                'sale_price' => 89,
                'is_free' => false,
                'instructor_name' => 'Hanson Deck',
                'instructor_avatar_url' => 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
                'rating' => 4.7,
                'reviews_count' => 19,
                'is_trending' => true,
                'is_featured' => false,
                'is_popular' => false,
            ],
        ];

        $freeCurriculum = [
            'summary' => 'Free sample course — watch YouTube and MP4 lessons without login.',
            'sections' => [
                [
                    'title' => 'Free intro',
                    'lessons' => [
                        [
                            'title' => 'Getting Started (YouTube)',
                            'duration' => '04:00',
                            'video_type' => 'youtube',
                            'video_url' => 'https://www.youtube.com/watch?v=ysz5S6PUM-U',
                            'is_preview' => true,
                        ],
                        [
                            'title' => 'Sample Lecture (MP4)',
                            'duration' => '06:00',
                            'video_type' => 'mp4',
                            'video_url' => 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
                            'is_preview' => true,
                        ],
                    ],
                ],
            ],
        ];

        $paidCurriculum = [
            'summary' => 'Paid sample course — login required to watch full lessons. First lesson is a free preview.',
            'sections' => [
                [
                    'title' => 'Paid modules',
                    'lessons' => [
                        [
                            'title' => 'Preview Lesson (YouTube)',
                            'duration' => '03:00',
                            'video_type' => 'youtube',
                            'video_url' => 'https://www.youtube.com/watch?v=ScMzIvxBSi4',
                            'is_preview' => true,
                        ],
                        [
                            'title' => 'Full Lesson (MP4) — Login required',
                            'duration' => '10:00',
                            'video_type' => 'mp4',
                            'video_url' => 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
                            'is_preview' => false,
                        ],
                        [
                            'title' => 'Advanced Topic (YouTube) — Login required',
                            'duration' => '08:00',
                            'video_type' => 'youtube',
                            'video_url' => 'https://www.youtube.com/watch?v=aqz-KE-bpKQ',
                            'is_preview' => false,
                        ],
                    ],
                ],
            ],
        ];

        foreach ($samples as $sample) {
            $isFree = (bool) ($sample['is_free'] ?? false) || (float) ($sample['price'] ?? 0) <= 0;
            $curriculum = $isFree ? $freeCurriculum : $paidCurriculum;

            $instructorId = null;
            if (! empty($sample['instructor_name'])) {
                $instructorId = Instructor::query()
                    ->withoutGlobalScope('company')
                    ->where('company_id', $company->id)
                    ->where('name', $sample['instructor_name'])
                    ->value('id');
            }

            Course::withoutGlobalScope('company')->updateOrCreate(
                [
                    'company_id' => $company->id,
                    'slug' => $sample['slug'],
                ],
                array_merge($sample, [
                    'company_id' => $company->id,
                    'instructor_id' => $instructorId,
                    'status' => 'published',
                    'published_at' => now(),
                    'description' => $sample['summary'],
                    'curriculum' => $curriculum,
                    'lessons_count' => $isFree ? 2 : 3,
                    'duration_weeks' => max(1, (int) ceil(($sample['duration_hours'] ?? 8) / 8)),
                    'skill_level' => 'Beginner',
                    'language' => 'English',
                    'pass_percentage' => 84,
                    'deadline' => now()->addMonths(3)->toDateString(),
                ])
            );
        }
    }
}
