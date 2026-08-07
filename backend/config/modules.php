<?php

return [
    'registry' => [
        'auth' => [
            'name' => 'การยืนยันตัวตน',
            'enabled' => true,
            'dependencies' => [],
        ],
        'company' => [
            'name' => 'บริษัท / สถานศึกษา',
            'enabled' => true,
            'dependencies' => [],
        ],
        'user' => [
            'name' => 'ผู้ใช้',
            'enabled' => true,
            'dependencies' => ['auth', 'company'],
        ],
        'role' => [
            'name' => 'บทบาท',
            'enabled' => true,
            'dependencies' => ['auth'],
        ],
        'permission' => [
            'name' => 'สิทธิ์',
            'enabled' => true,
            'dependencies' => ['role'],
        ],
        'setting' => [
            'name' => 'การตั้งค่า',
            'enabled' => true,
            'dependencies' => ['company'],
        ],
        'media' => [
            'name' => 'สื่อ',
            'enabled' => true,
            'dependencies' => ['company'],
        ],
        'course' => [
            'name' => 'คอร์ส',
            'enabled' => true,
            'dependencies' => ['user'],
        ],
        'instructor' => [
            'name' => 'วิทยากร',
            'enabled' => true,
            'dependencies' => ['company'],
        ],
        'enrollment' => [
            'name' => 'การลงทะเบียน / ซื้อคอร์ส',
            'enabled' => true,
            'dependencies' => ['course', 'user'],
        ],
        'cms' => [
            'name' => 'CMS (Hero / Categories)',
            'enabled' => true,
            'dependencies' => ['company'],
        ],
        'lesson' => [
            'name' => 'บทเรียน',
            'enabled' => false,
            'dependencies' => ['course'],
        ],
        'quiz' => [
            'name' => 'แบบทดสอบ',
            'enabled' => true,
            'dependencies' => ['course'],
        ],
        'certificate' => [
            'name' => 'ใบรับรอง',
            'enabled' => true,
            'dependencies' => ['course'],
        ],
        'blog' => [
            'name' => 'บล็อก',
            'enabled' => true,
            'dependencies' => ['company'],
        ],
        'knowledge' => [
            'name' => 'คลังความรู้',
            'enabled' => false,
            'dependencies' => ['media'],
        ],
        'crm' => [
            'name' => 'CRM',
            'enabled' => true,
            'dependencies' => ['company'],
        ],
        'notification' => [
            'name' => 'การแจ้งเตือน',
            'enabled' => false,
            'dependencies' => ['user'],
        ],
        'report' => [
            'name' => 'รายงาน',
            'enabled' => false,
            'dependencies' => ['company'],
        ],
    ],
];
