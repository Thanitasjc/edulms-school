<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('company_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('status')->default('pending')->index();
            $table->string('gateway')->default('demo')->index();
            $table->decimal('amount', 12, 2)->default(0);
            $table->string('currency', 10)->default('THB');
            $table->string('external_id')->nullable()->index();
            $table->text('checkout_url')->nullable();
            $table->timestamp('paid_at')->nullable();
            $table->json('meta')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('payment_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('payment_id')->constrained()->cascadeOnDelete();
            $table->foreignId('course_id')->constrained()->cascadeOnDelete();
            $table->string('title');
            $table->decimal('amount', 12, 2)->default(0);
            $table->timestamps();

            $table->unique(['payment_id', 'course_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payment_items');
        Schema::dropIfExists('payments');
    }
};
