# Laravel Reverb Real-Time Notification Flow

## Overview

This document explains how the Laravel Reverb WebSocket implementation works for real-time notifications in the CFAR-HRIS-CheckWise application, specifically for the absence request flow.

## Architecture

### Frontend Configuration

#### 1. Echo Configuration (`resources/js/app.tsx`)

Echo is now configured using `@laravel/echo-react` package in the main `app.tsx` file:

```typescript
import { configureEcho } from '@laravel/echo-react';
import Pusher from 'pusher-js';

configureEcho({
    broadcaster: 'reverb',
    key: import.meta.env.VITE_REVERB_APP_KEY,
    wsHost: reverbHost,
    wsPort: reverbPort,
    wssPort: reverbPort,
    forceTLS: !isLocalhost,
    enabledTransports: isLocalhost ? ['ws'] : ['ws', 'wss'],
    disableStats: true,
    authEndpoint: '/broadcasting/auth',
    auth: {
        headers: {
            'X-CSRF-TOKEN': getCSRFToken(),
            'X-Requested-With': 'XMLHttpRequest',
            Accept: 'application/json',
        },
    },
});
```

**Key Configuration Points:**

- Uses Reverb as the broadcaster
- Automatically detects localhost vs production for TLS configuration
- Includes CSRF token for authentication
- Configures proper auth endpoint for private channels

#### 2. Using Echo in Components (`resources/js/components/site-header.tsx`)

Components use the `useEcho()` hook from `@laravel/echo-react`:

```typescript
import { useEcho } from '@laravel/echo-react';

export function SiteHeader() {
    const echo = useEcho();

    useEffect(() => {
        if (!echo) return;

        // Subscribe to channels
        const notificationChannel = echo.channel('notifications');

        // Listen for events
        notificationChannel.listen('.AbsenceRequested', (e) => {
            // Handle real-time notification
            console.log('Received absence request:', e);
            // Update UI state
        });

        return () => {
            // Cleanup
            notificationChannel.stopListening('.AbsenceRequested');
        };
    }, [echo]);
}
```

### Backend Implementation

#### 1. Broadcasting Channels (`routes/channels.php`)

Define channel authorization:

```php
// Public notifications channel
Broadcast::channel('notifications', function ($user) {
    return Auth::check() || Session::has('employee_id');
});

// Private supervisor channels
Broadcast::channel('supervisor.{supervisorId}', function ($user, $supervisorId) {
    return Auth::check() && $user->id == $supervisorId;
});
```

#### 2. Event Broadcasting (`app/Events/AbsenceRequested.php`)

The event implements `ShouldBroadcastNow` for immediate broadcasting:

```php
class AbsenceRequested implements ShouldBroadcastNow
{
    public function __construct(public Absence $absence) {}

    public function broadcastOn(): array
    {
        $channels = [new Channel('notifications')];

        // Also send to supervisor's private channel
        if ($supervisor = User::getSupervisorForDepartment($this->absence->department)) {
            $channels[] = new PrivateChannel('supervisor.' . $supervisor->id);
        }

        return $channels;
    }

    public function broadcastAs(): string
    {
        return 'AbsenceRequested';
    }

    public function broadcastWith(): array
    {
        return [
            'absence_id' => $this->absence->id,
            'employee_name' => $this->absence->employee->employee_name,
            'department' => $this->absence->department,
            // ... other data
        ];
    }
}
```

#### 3. Controller Triggering (`app/Http/Controllers/AbsenceController.php`)

When an absence request is submitted:

```php
public function store(Request $request)
{
    $validated = $request->validate([...]);

    $absence = Absence::create($validated);

    // Broadcast the event
    event(new AbsenceRequested($absence));

    return response()->json(['success' => true]);
}
```

## Complete Flow

### Step-by-Step Process

1. **Employee Submits Form** (`absence-request-form.tsx`)

    ```typescript
    const response = await axios.post('/employee-view/absence', {
        employee_id: employee?.id,
        full_name: employee?.employee_name,
        department: employee?.department,
        // ... other fields
    });
    ```

2. **Backend Receives Request** (`AbsenceController::store`)

    - Validates the request data
    - Creates the absence record in database
    - Fires the `AbsenceRequested` event

3. **Event Broadcasting** (`AbsenceRequested`)

    - Event implements `ShouldBroadcastNow` for immediate broadcast
    - Broadcasts to `notifications` public channel
    - Broadcasts to supervisor's private channel `supervisor.{id}`
    - Includes absence data in the payload

4. **Laravel Reverb Transmits**

    - Reverb WebSocket server receives the broadcast
    - Transmits to all connected clients subscribed to the channels

5. **Frontend Receives** (`site-header.tsx`)

    - Echo listener receives the `.AbsenceRequested` event
    - Updates local state with new notification
    - Increments unread count
    - Shows toast notification

6. **UI Updates Automatically**
    - Bell notification badge updates with new count
    - Notification appears in dropdown
    - No page refresh required

## Environment Variables Required

Add these to your `.env` file:

```env
BROADCAST_CONNECTION=reverb

REVERB_APP_ID=your-app-id
REVERB_APP_KEY=your-app-key
REVERB_APP_SECRET=your-app-secret
REVERB_HOST=127.0.0.1
REVERB_PORT=8080
REVERB_SCHEME=http

VITE_REVERB_APP_KEY="${REVERB_APP_KEY}"
VITE_REVERB_HOST="${REVERB_HOST}"
VITE_REVERB_PORT="${REVERB_PORT}"
VITE_REVERB_SCHEME="${REVERB_SCHEME}"
```

## Running Laravel Reverb

### Development

Start the Reverb server:

```bash
php artisan reverb:start
```

With debugging:

```bash
php artisan reverb:start --debug
```

### Production

Use a process manager like Supervisor to keep Reverb running:

```ini
[program:reverb]
command=php /path/to/artisan reverb:start
autostart=true
autorestart=true
user=forge
redirect_stderr=true
stdout_logfile=/path/to/reverb.log
```

## Advantages of This Implementation

1. **Using @laravel/echo-react Package**

    - Better React integration with hooks
    - Automatic connection management
    - Type-safe Echo access
    - Cleaner component code

2. **Centralized Configuration**

    - Echo configured once in `app.tsx`
    - All components use `useEcho()` hook
    - Easy to maintain and update

3. **Real-Time Without Polling**

    - No need to refresh page
    - Instant notification delivery
    - Reduced server load

4. **Scalable Architecture**
    - Can broadcast to multiple channels
    - Supports both public and private channels
    - Easy to add new event types

## Debugging

### Check Echo Connection

In browser console:

```javascript
// Check if Echo is available
console.log(window.Echo);

// Check connection state
console.log(window.Echo.connector.pusher.connection.state);
```

### Monitor Reverb Server

Watch server logs:

```bash
php artisan reverb:start --debug
```

### Test Broadcasting

Test from Laravel Tinker:

```php
php artisan tinker

$absence = App\Models\Absence::first();
event(new App\Events\AbsenceRequested($absence));
```

## Troubleshooting

### Connection Issues

1. Ensure Reverb server is running
2. Check CSRF token is present in HTML meta tag
3. Verify environment variables are set
4. Check firewall/port settings

### Events Not Received

1. Verify channel authorization in `routes/channels.php`
2. Check event implements `ShouldBroadcastNow`
3. Ensure frontend is subscribed to correct channel
4. Verify event name matches (`.AbsenceRequested`)

### Authentication Fails

1. Check CSRF token in headers
2. Verify user is authenticated
3. Check session is valid
4. Ensure `authEndpoint` is correct

## Related Files

- Frontend Configuration: `resources/js/app.tsx`
- Bell Notifications: `resources/js/components/site-header.tsx`
- Notification Component: `resources/js/components/customize/bell-notification.tsx`
- Absence Form: `resources/js/pages/employee-view/request-form/absence/absence-request-form.tsx`
- Backend Event: `app/Events/AbsenceRequested.php`
- Backend Controller: `app/Http/Controllers/AbsenceController.php`
- Channel Routes: `routes/channels.php`
- Reverb Config: `config/reverb.php`

## Additional Resources

- [Laravel Reverb Documentation](https://laravel.com/docs/12.x/reverb)
- [Laravel Broadcasting Documentation](https://laravel.com/docs/12.x/broadcasting)
- [Laravel Echo React Package](https://github.com/laravel/echo-react)
