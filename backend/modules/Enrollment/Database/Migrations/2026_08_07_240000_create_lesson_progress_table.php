<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('lesson_progress', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->foreignId('enrollment_id')->constrained()->cascadeOnDelete();
            $table->foreignId('course_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('lesson_key');
            $table->unsignedInteger('section_index')->default(0);
            $table->unsignedInteger('lesson_index')->default(0);
            $table->string('lesson_title')->nullable();
            $table->string('status')->default('in_progress'); // in_progress|completed
            $table->timestamp('last_viewed_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->unique(['user_id', 'course_id', 'lesson_key']);
            $table->index(['enrollment_id', 'status']);
            $table->index(['course_id', 'user_id']);
        });

        Schema::table('enrollments', function (Blueprint $table) {
            $table->unsignedTinyInteger('progress_percent')->default(0)->after('enrolled_at');
            $table->unsignedInteger('completed_lessons')->default(0)->after('progress_percent');
            $table->unsignedInteger('total_lessons')->default(0)->after('completed_lessons');
            $table->string('last_lesson_key')->nullable()->after('total_lessons');
            $table->unsignedInteger('last_section_index')->nullable()->after('last_lesson_key');
            $table->unsignedInteger('last_lesson_index')->nullable()->after('last_section_index');
            $table->timestamp('progress_updated_at')->nullable()->after('last_lesson_index');
        });
    }

    public function down(): void
    {
        Schema::table('enrollments', function (Blueprint $table) {
            $table->dropColumn([
                'progress_percent',
                'completed_lessons',
                'total_lessons',
                'last_lesson_key',
                'last_section_index',
                'last_lesson_index',
                'progress_updated_at',
            ]);
        });

        Schema::dropIfExists('lesson_progress');
    }
};
