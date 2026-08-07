<?php

namespace App\Core\Support;

final class TenantContext
{
    private static ?int $companyId = null;

    private static bool $bypassed = false;

    public static function set(?int $companyId): void
    {
        self::$companyId = $companyId;
    }

    public static function id(): ?int
    {
        return self::$companyId;
    }

    public static function bypass(bool $bypass = true): void
    {
        self::$bypassed = $bypass;
    }

    public static function bypassed(): bool
    {
        return self::$bypassed;
    }

    public static function clear(): void
    {
        self::$companyId = null;
        self::$bypassed = false;
    }
}
