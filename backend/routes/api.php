<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return response()->json([
        'success' => true,
        'message' => __('api.welcome'),
        'version' => 'v1',
        'locale' => app()->getLocale(),
    ]);
});
