<?php

return [
    'ok' => 'OK',
    'created' => 'Created successfully',
    'deleted' => 'Deleted successfully',
    'updated' => 'Updated successfully',
    'restored' => 'Restored successfully',
    'server_error' => 'Server Error',
    'http_error' => 'HTTP Error',
    'not_found' => 'Resource not found.',
    'welcome' => 'Enterprise LMS API',

    'auth' => [
        'registered' => 'Registered successfully.',
        'logged_in' => 'Logged in successfully.',
        'logged_out' => 'Logged out successfully.',
        'logged_out_all' => 'Logged out from all devices successfully.',
        'profile_retrieved' => 'Profile retrieved successfully.',
        'invalid_credentials' => 'The provided credentials are incorrect.',
        'inactive_account' => 'This account is not active.',
        'public_school_unavailable' => 'No public school is available for learner signup.',
    ],

    'tenant' => [
        'company_not_found' => 'Company not found.',
        'required' => 'No company assigned to this user.',
        'forbidden' => 'You do not have access to this company.',
    ],

    'module' => [
        'disabled' => 'Module [:module] is disabled.',
        'retrieved' => 'Modules retrieved successfully.',
        'bootstrap_retrieved' => 'Bootstrap data retrieved successfully.',
    ],

    'company' => [
        'retrieved_list' => 'Companies retrieved successfully.',
        'retrieved' => 'Company retrieved successfully.',
        'created' => 'Company created successfully.',
        'updated' => 'Company updated successfully.',
        'deleted' => 'Company deleted successfully.',
        'restored' => 'Company restored successfully.',
    ],

    'user' => [
        'retrieved_list' => 'Users retrieved successfully.',
        'retrieved' => 'User retrieved successfully.',
        'created' => 'User created successfully.',
        'updated' => 'User updated successfully.',
        'deleted' => 'User deleted successfully.',
        'restored' => 'User restored successfully.',
    ],

    'role' => [
        'retrieved_list' => 'Roles retrieved successfully.',
        'retrieved' => 'Role retrieved successfully.',
        'created' => 'Role created successfully.',
        'updated' => 'Role updated successfully.',
        'deleted' => 'Role deleted successfully.',
        'permissions_retrieved' => 'Permissions retrieved successfully.',
        'system_protected' => 'System roles cannot be renamed or deleted.',
    ],

    'setting' => [
        'retrieved_list' => 'Settings retrieved successfully.',
        'saved' => 'Setting saved successfully.',
        'updated' => 'Setting updated successfully.',
        'deleted' => 'Setting deleted successfully.',
        'restored' => 'Setting restored successfully.',
    ],

        'course' => [
        'retrieved_list' => 'Courses retrieved successfully.',
        'retrieved' => 'Course retrieved successfully.',
        'created' => 'Course created successfully.',
        'updated' => 'Course updated successfully.',
        'deleted' => 'Course deleted successfully.',
        'restored' => 'Course restored successfully.',
        'video_uploaded' => 'Video uploaded successfully.',
        'image_uploaded' => 'Image uploaded successfully.',
    ],

    'instructor' => [
        'retrieved_list' => 'Instructors retrieved successfully.',
        'retrieved' => 'Instructor retrieved successfully.',
        'created' => 'Instructor created successfully.',
        'updated' => 'Instructor updated successfully.',
        'deleted' => 'Instructor deleted successfully.',
        'restored' => 'Instructor restored successfully.',
    ],

    'enrollment' => [
        'retrieved_list' => 'Enrollments retrieved successfully.',
        'retrieved' => 'Enrollment retrieved successfully.',
        'purchased' => 'Course purchased successfully.',
        'checkout_completed' => 'Checkout completed successfully.',
        'cancelled' => 'Enrollment cancelled successfully.',
        'already_enrolled' => 'You are already enrolled in this course.',
        'course_not_found' => 'Course not found or not published.',
    ],

    'payment' => [
        'checkout_created' => 'Payment session created. Complete payment to enroll.',
        'retrieved' => 'Payment retrieved successfully.',
        'paid' => 'Payment completed successfully.',
        'pending' => 'Payment is still pending.',
        'demo_only' => 'This confirm endpoint is only available for demo payments.',
        'empty_cart' => 'No courses selected for checkout.',
        'invalid_webhook' => 'Invalid payment webhook payload.',
    ],

    'progress' => [
        'retrieved' => 'Learning progress retrieved successfully.',
        'updated' => 'Learning progress updated successfully.',
        'not_enrolled' => 'Enroll in this course to track progress.',
    ],

    'review' => [
        'retrieved_list' => 'Reviews retrieved successfully.',
        'created' => 'Review submitted successfully.',
        'updated' => 'Review updated successfully.',
        'deleted' => 'Review deleted successfully.',
        'already_reviewed' => 'You have already reviewed this course.',
    ],

    'cms' => [
        'categories_retrieved' => 'Categories retrieved successfully.',
        'category_created' => 'Category created successfully.',
        'category_updated' => 'Category updated successfully.',
        'category_deleted' => 'Category deleted successfully.',
        'hero_retrieved' => 'Hero slides retrieved successfully.',
        'hero_created' => 'Hero slide created successfully.',
        'hero_updated' => 'Hero slide updated successfully.',
        'hero_deleted' => 'Hero slide deleted successfully.',
    ],

    'media' => [
        'retrieved_list' => 'Media assets retrieved successfully.',
        'uploaded' => 'Media uploaded successfully.',
        'deleted' => 'Media deleted successfully.',
    ],

    'crm' => [
        'retrieved_list' => 'Leads retrieved successfully.',
        'retrieved' => 'Lead retrieved successfully.',
        'lead_created' => 'Lead submitted successfully.',
        'updated' => 'Lead updated successfully.',
        'deleted' => 'Lead deleted successfully.',
    ],

    'blog' => [
        'retrieved_list' => 'Blog posts retrieved successfully.',
        'retrieved' => 'Blog post retrieved successfully.',
        'created' => 'Blog post created successfully.',
        'updated' => 'Blog post updated successfully.',
        'deleted' => 'Blog post deleted successfully.',
    ],

    'quiz' => [
        'retrieved_list' => 'Quizzes retrieved successfully.',
        'retrieved' => 'Quiz retrieved successfully.',
        'created' => 'Quiz created successfully.',
        'updated' => 'Quiz updated successfully.',
        'deleted' => 'Quiz deleted successfully.',
        'not_found' => 'Quiz not found or not published.',
        'not_enrolled' => 'Enroll in this course to take the quiz.',
        'attempt_submitted' => 'Quiz attempt submitted successfully.',
    ],

    'certificate' => [
        'retrieved_list' => 'Certificates retrieved successfully.',
        'retrieved' => 'Certificate retrieved successfully.',
        'created' => 'Certificate issued successfully.',
        'not_found' => 'Certificate not found.',
    ],
];
