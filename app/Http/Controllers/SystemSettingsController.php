<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Inertia\Response;

class SystemSettingsController extends Controller
{
    /**
     * Display the system settings index page
     */
    public function index(): Response
    {
        return Inertia::render('system-settings/index');
    }
}

