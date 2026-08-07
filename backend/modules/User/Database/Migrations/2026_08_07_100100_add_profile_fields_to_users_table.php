<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('phone')->nullable()->after('email');
            $table->string('avatar_path')->nullable()->after('phone');
            $table->string('status')->default('active')->after('avatar_path')->index();
            $table->boolean('is_super_admin')->default(false)->after('status');
            $table->foreignId('current_company_id')->nullable()->after('is_super_admin');
            $table->softDeletes();
        });

        Schema::table('users', function (Blueprint $table) {
            $table->foreign('current_company_id')
                ->references('id')
                ->on('companies')
                ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['current_company_id']);
            $table->dropColumn([
                'phone',
                'avatar_path',
                'status',
                'is_super_admin',
                'current_company_id',
                'deleted_at',
            ]);
        });
    }
};
