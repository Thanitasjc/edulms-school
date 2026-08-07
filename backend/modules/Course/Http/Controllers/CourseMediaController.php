<?php

namespace Modules\Course\Http\Controllers;

use App\Core\Support\ApiResponse;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CourseMediaController extends Controller
{
    public function uploadVideo(Request $request): JsonResponse
    {
        abort_unless($request->user()?->can('course.update') || $request->user()?->can('course.create') || $request->user()?->is_super_admin, 403);

        $validated = $request->validate([
            'file' => ['required', 'file', 'mimetypes:video/mp4,video/quicktime', 'max:102400'],
        ]);

        /** @var \Illuminate\Http\UploadedFile $file */
        $file = $validated['file'];
        $path = $file->store('course-videos', 'public');

        return ApiResponse::created([
            'url' => asset('storage/'.$path),
            'path' => $path,
            'original_name' => $file->getClientOriginalName(),
        ], __('api.course.video_uploaded'));
    }

    public function uploadImage(Request $request): JsonResponse
    {
        abort_unless(
            $request->user()?->can('course.update')
            || $request->user()?->can('course.create')
            || $request->user()?->can('instructor.update')
            || $request->user()?->can('instructor.create')
            || $request->user()?->can('cms.update')
            || $request->user()?->can('cms.create')
            || $request->user()?->is_super_admin,
            403
        );

        $validated = $request->validate([
            'file' => ['required', 'file', 'image', 'mimes:jpg,jpeg,png,webp,gif', 'max:5120'],
        ]);

        /** @var \Illuminate\Http\UploadedFile $file */
        $file = $validated['file'];
        $path = $file->store('course-images', 'public');

        return ApiResponse::created([
            'url' => asset('storage/'.$path),
            'path' => $path,
            'original_name' => $file->getClientOriginalName(),
        ], __('api.course.image_uploaded'));
    }
}
