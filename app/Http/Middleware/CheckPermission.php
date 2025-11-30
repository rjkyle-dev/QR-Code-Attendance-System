<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckPermission
{
  /**
   * Handle an incoming request.
   *
   * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
   */
  public function handle(Request $request, Closure $next, string $permission): Response
  {
    $user = $request->user();
    if (!$user) {
      abort(403, 'Unauthorized action.');
    }

    // Super Admin bypasses all permission checks
    if ($user->hasRole('Super Admin')) {
      return $next($request);
    }

    // Support multiple permissions separated by '|' or ',' (OR semantics)
    $permissions = preg_split('/[\|,]/', $permission) ?: [];
    foreach ($permissions as $singlePermission) {
      $singlePermission = trim($singlePermission);
      if ($singlePermission === '') {
        continue;
      }
      // Check permission with explicit guard
      if ($user->hasPermissionTo($singlePermission, 'web')) {
        return $next($request);
      }
    }

    abort(403, 'Unauthorized action.');
  }
}
