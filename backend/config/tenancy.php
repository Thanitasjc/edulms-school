<?php

return [
    'header' => 'X-Company-Id',
    'query_parameter' => 'company_id',
    /*
     * Public learner signup joins this company by slug when present.
     */
    'public_company_slug' => env('PUBLIC_COMPANY_SLUG', 'demo-academy'),
];
