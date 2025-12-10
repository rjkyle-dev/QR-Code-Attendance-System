<?php

namespace App\Http\Controllers;

use Illuminate\Broadcasting\BroadcastController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;

class BroadcastAuthController extends BroadcastController
{
  
  public function authenticate(Request $request)
  {
    Log::info('=== Broadcasting Auth Attempt ===', [
      'url' => $request->fullUrl(),
      'method' => $request->method(),
      'channel_name' => $request->input('channel_name'),
      'socket_id' => $request->input('socket_id'),
      'headers' => [
        'x-csrf-token' => $request->header('X-CSRF-TOKEN') ? 'present' : 'missing',
        'x-requested-with' => $request->header('X-Requested-With'),
        'cookie' => $request->header('Cookie') ? 'present' : 'missing',
      ],
      'auth_check' => Auth::check(),
      'auth_id' => Auth::id(),
      'auth_user' => Auth::user() ? [
        'id' => Auth::user()->id,
        'email' => Auth::user()->email,
        'name' => Auth::user()->firstname . ' ' . Auth::user()->lastname,
      ] : null,
      'session_id' => session()->getId(),
      'has_session_token' => session()->has('_token'),
    ]);

    try {
      $response = parent::authenticate($request);

      Log::info('Broadcasting auth SUCCESS', [
        'channel_name' => $request->input('channel_name'),
        'response_status' => $response->getStatusCode(),
      ]);

      return $response;
    } catch (\Exception $e) {
      Log::error('Broadcasting auth FAILED', [
        'channel_name' => $request->input('channel_name'),
        'error' => $e->getMessage(),
        'trace' => $e->getTraceAsString(),
      ]);

      throw $e;
    }
  }
}
