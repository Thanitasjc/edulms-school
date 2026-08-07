<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('courses', function (Blueprint $table) {
            $table->unsignedInteger('duration_weeks')->nullable()->after('duration_hours');
            $table->string('skill_level')->nullable()->after('duration_weeks');
            $table->string('language')->nullable()->after('skill_level');
            $table->unsignedTinyInteger('pass_percentage')->nullable()->after('language');
            $table->date('deadline')->nullable()->after('pass_percentage');
        });
    }

    public function down(): void
    {
        Schema::table('courses', function (Blueprint $table) {
            $table->dropColumn([
                'duration_weeks',
                'skill_level',
                'language',
                'pass_percentage',
                'deadline',
            ]);
        });
    }
};
