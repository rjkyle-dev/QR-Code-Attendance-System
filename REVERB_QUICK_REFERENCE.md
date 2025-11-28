# Laravel Reverb Quick Reference

## Quick Start Commands

```bash
# Start Reverb server
php artisan reverb:start

# Start with debugging
php artisan reverb:start --debug

# Install Reverb (if needed)
php artisan install:broadcasting

# Restart Reverb
php artisan reverb:restart
```

## Key Files Modified

### 1. Frontend Configuration (`resources/js/app.tsx`)

```typescript
import { configureEcho } from '@laravel/echo-react';

// Configure Echo with Reverb
configureEcho({
    broadcaster: 'reverb',
    key: import.meta.env.VITE_REVERB_APP_KEY,
    wsHost: reverbHost,
    wsPort: reverbPort,
    forceTLS: !isLocalhost,
    authEndpoint: '/broadcasting/auth',
    auth: {
        headers: {
            'X-CSRF-TOKEN': getCSRFToken(),
        },
    },
});
```

### 2. Using Echo in Components

```typescript
import { useEcho } from '@laravel/echo-react';

function MyComponent() {
    const echo = useEcho();

    useEffect(() => {
        if (!echo) return;

        const channel = echo.channel('notifications');

        channel.listen('.AbsenceRequested', (e) => {
            // Handle event
            console.log('Event received:', e);
        });

        return () => {
            channel.stopListening('.AbsenceRequested');
        };
    }, [echo]);
}
```

## Channel Types

### Public Channel

```typescript
const channel = echo.channel('notifications');
```

### Private Channel

```typescript
const channel = echo.private(`supervisor.${userId}`);
```

### Presence Channel

```typescript
const channel = echo.join(`chat.${roomId}`);
```

## Backend Event Structure

```php
class AbsenceRequested implements ShouldBroadcastNow
{
    public function broadcastOn(): array
    {
        return [
            new Channel('notifications'),
            new PrivateChannel('supervisor.' . $this->supervisorId),
        ];
    }

    public function broadcastAs(): string
    {
        return 'AbsenceRequested'; // No dot here
    }

    public function broadcastWith(): array
    {
        return [
            'absence_id' => $this->absence->id,
            // ... data
        ];
    }
}
```

## Environment Variables

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

## Debugging Snippets

### Check Echo Connection

```javascript
// In browser console
console.log(window.Echo);
console.log(window.Echo.connector.pusher.connection.state);
```

### Test Event from Tinker

```php
php artisan tinker

$absence = App\Models\Absence::first();
event(new App\Events\AbsenceRequested($absence));
```

### Monitor Connection State

```typescript
useEffect(() => {
    const connector = (echo as any).connector;
    const connection = connector?.pusher?.connection;

    connection?.bind('state_change', (states: any) => {
        console.log('State:', states.previous, '->', states.current);
    });
}, [echo]);
```

## Common Issues & Solutions

| Issue              | Solution                                           |
| ------------------ | -------------------------------------------------- |
| Echo not defined   | Check `configureEcho()` is called in app.tsx       |
| Connection refused | Ensure Reverb server is running                    |
| 403 Forbidden      | Check channel authorization in routes/channels.php |
| Event not received | Verify event name (frontend has `.` prefix)        |
| CSRF token missing | Check meta tag exists in HTML                      |

## Event Name Convention

⚠️ **Important:** Event names differ between frontend and backend

**Backend (broadcastAs):**

```php
return 'AbsenceRequested'; // No dot
```

**Frontend (listen):**

```typescript
channel.listen('.AbsenceRequested', ...); // With dot
```

## Flow Diagram

```
Employee Form Submission
    ↓
POST /employee-view/absence
    ↓
AbsenceController::store()
    ↓
Create Absence Record
    ↓
event(new AbsenceRequested($absence))
    ↓
Laravel Reverb Server
    ↓
WebSocket Broadcast
    ↓
Connected Clients (Supervisors)
    ↓
Echo Listener (.AbsenceRequested)
    ↓
Update UI (Bell Notification)
    ↓
Toast Notification + Badge Update
```

## Production Checklist

- [ ] Reverb running with process manager (Supervisor)
- [ ] SSL/TLS configured (wss://)
- [ ] Nginx reverse proxy configured
- [ ] Redis configured for scaling (if needed)
- [ ] Log rotation set up
- [ ] Monitoring in place
- [ ] Error tracking configured
- [ ] Load tested
- [ ] Backup Reverb instances (if scaling)

## Important Notes

1. **Use `@laravel/echo-react`** - Not plain `laravel-echo` directly
2. **Configure in app.tsx** - Single source of configuration
3. **Use `useEcho()` hook** - In all components that need Echo
4. **Event names have dots** - Frontend: `.AbsenceRequested`
5. **ShouldBroadcastNow** - For immediate broadcasting
6. **Channel authorization** - Required for private channels

## Links

- [Full Setup Guide](./LARAVEL_REVERB_SETUP.md)
- [Testing Guide](./TESTING_REVERB_FLOW.md)
- [Laravel Reverb Docs](https://laravel.com/docs/12.x/reverb)
