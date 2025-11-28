<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class LogBroadcastAuth
{
  public function handle(Request $request, Closure $next): Response
  {
    // Log at the very start to ensure middleware is hit
    Log::info('🔔 MIDDLEWARE HIT - Broadcasting auth request received');

    Log::info('=== Broadcasting Auth Attempt (Middleware) ===', [
      'url' => $request->fullUrl(),
      'method' => $request->method(),
      'channel_name' => $request->input('channel_name'),
      'socket_id' => $request->input('socket_id'),
      'headers' => [
        'x-csrf-token' => $request->header('X-CSRF-TOKEN') ? 'present' : 'missing',
        'x-requested-with' => $request->header('X-Requested-With'),
        'cookie' => $request->header('Cookie') ? 'present' : 'missing',
        'content-type' => $request->header('Content-Type'),
      ],
      'auth_guard_web_check' => Auth::guard('web')->check(),
      'auth_guard_web_id' => Auth::guard('web')->id(),
      'auth_check' => Auth::check(),
      'auth_id' => Auth::id(),
      'auth_user' => Auth::user() ? [
        'id' => Auth::user()->id,
        'email' => Auth::user()->email ?? null,
        'firstname' => Auth::user()->firstname ?? null,
        'lastname' => Auth::user()->lastname ?? null,
      ] : null,
      'session_id' => session()->getId(),
      'has_session_token' => session()->has('_token'),
      'request_all' => $request->all(),
    ]);

    $response = $next($request);

    Log::info('=== Broadcasting Auth Response ===', [
      'status' => $response->getStatusCode(),
      'channel_name' => $request->input('channel_name'),
    ]);

    return $response;
  }
}
