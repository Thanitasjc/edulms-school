<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('enrollments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->foreignId('course_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('status')->default('active');
            $table->decimal('amount_paid', 10, 2)->default(0);
            $table->string('currency', 10)->default('THB');
            $table->string('source')->default('purchase');
            $table->timestamp('enrolled_at')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->unique(['course_id', 'user_id']);
            $table->index(['company_id', 'user_id']);
            $table->index(['company_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('enrollments');
    }
};
