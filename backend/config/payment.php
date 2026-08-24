<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Payment driver
    |--------------------------------------------------------------------------
    |
    | "stripe" — Stripe Checkout (requires STRIPE_SECRET + STRIPE_WEBHOOK_SECRET)
    | "demo"   — Simulated pay page for local/demo without Stripe keys
    |
    | When driver is "stripe" but STRIPE_SECRET is empty, the app falls back to "demo".
    */
    'driver' => env('PAYMENT_DRIVER', 'stripe'),

    'currency' => env('PAYMENT_CURRENCY', 'thb'),

    'frontend_url' => rtrim(env('FRONTEND_URL', env('APP_URL', 'http://localhost:3000')), '/'),

    'stripe' => [
        'secret' => env('STRIPE_SECRET'),
        'publishable' => env('STRIPE_PUBLISHABLE_KEY'),
        'webhook_secret' => env('STRIPE_WEBHOOK_SECRET'),
        'api_base' => env('STRIPE_API_BASE', 'https://api.stripe.com'),
    ],
];
