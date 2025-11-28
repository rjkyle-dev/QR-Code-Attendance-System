# Debug Laravel Reverb Real-Time Notifications

## Issue: Notification count not updating in real-time

The badge shows "5", submits a form, but stays at "5" until page refresh (then shows "6").

## Step-by-Step Debugging

### Step 1: Check if Reverb Server is Running

Open a new terminal and run:

```bash
php artisan reverb:start --debug
```

**Expected Output:**

```
Reverb server started on 127.0.0.1:8080
```

**If you see an error:**

- Port 8080 might be in use
- Kill any existing process using port 8080
- Try restarting: `php artisan reverb:restart`

### Step 2: Open Browser Console

1. Log in as **Supervisor** (the one who should receive notifications)
2. Open Developer Tools (F12)
3. Go to **Console** tab
4. Look for these messages:

**✅ GOOD - Should see:**

```
[Echo Config] Configuring Laravel Echo with Reverb...
[Echo Config] ✅ Echo configured successfully with Reverb
[Bell Notification] Setting up Echo listeners for user-specific notifications
[Bell Notification] Echo connection state: connected
[Bell Notification] ✅ Successfully subscribed to notification channel: supervisor.X
```

**❌ BAD - If you see:**

```
[Bell Notification] Echo connection state: disconnected
[Bell Notification] Echo connection state: connecting (stays here)
[Echo Config] CSRF token not found
[Bell Notification] Echo not available yet
```

### Step 3: Check Network Tab

1. Open **Network** tab in DevTools
2. Filter by **WS** (WebSocket)
3. You should see a connection to `ws://127.0.0.1:8080/app/...`
4. Status should be **101 Switching Protocols**
5. Click on it and go to **Messages** tab

**You should see:**

- Subscription messages
- Heartbeat/ping messages

### Step 4: Test Broadcasting

In the **Reverb terminal** (where you ran `php artisan reverb:start --debug`), when an absence is submitted, you should see:

```
[✔] Broadcasting event: App\Events\AbsenceRequested
[✔] Channels: notifications, private-supervisor.1
[✔] Clients notified: 2
```

**If you DON'T see this:**

- Event is not being broadcast
- Check backend implementation

### Step 5: Submit Test Form

1. Open **ANOTHER** browser window (or incognito)
2. Log in as **Employee**
3. Submit absence request form
4. Watch **BOTH** windows:
    - Employee: Should see "Success" message
    - Supervisor: Should see badge increment IMMEDIATELY

### Common Issues & Fixes

#### Issue 1: Reverb Server Not Running

**Symptom:** Console shows "connection refused" or "connecting" forever

**Fix:**

```bash
# Start Reverb server
php artisan reverb:start --debug
```

Keep this terminal open. You need Reverb running alongside your Laravel server.

#### Issue 2: Echo Connection State is "disconnected"

**Symptom:** Console shows `Echo connection state: disconnected`

**Fix:** Check browser console for specific error:

```javascript
// Run this in browser console
console.log(window.Echo);
console.log(window.Echo.connector.pusher.connection.state);
console.log(window.Echo.connector.pusher.connection);
```

**Possible causes:**

1. Reverb not running → Start it
2. Wrong host/port → Check .env matches
3. CSRF token missing → Check meta tag in HTML

#### Issue 3: Event Not Broadcasted

**Symptom:** No output in Reverb terminal when form is submitted

**Fix:** Check Laravel logs:

```bash
tail -f storage/logs/laravel.log
```

Look for:

```
Broadcasting AbsenceRequested event...
AbsenceRequested event broadcasted successfully
```

**If missing:**

- Check `BROADCAST_CONNECTION=reverb` in .env
- Restart Laravel: `php artisan optimize:clear`
- Check event implements `ShouldBroadcastNow`

#### Issue 4: Channel Authorization Failed (403)

**Symptom:** Console shows "403 Forbidden" for channel subscription

**Fix:** Check `routes/channels.php`:

```php
Broadcast::channel('supervisor.{supervisorId}', function ($user, $supervisorId) {
    return Auth::check() && $user->id == $supervisorId;
});
```

**Debug:**

```bash
# Check if user is authenticated
php artisan tinker
Auth::check() // should return true
Auth::id()    // should return supervisor ID
```

#### Issue 5: Wrong Channel Name

**Symptom:** Event broadcast but not received

**Fix:** Verify channel names match:

**Backend (Event):**

```php
// In AbsenceRequested.php
public function broadcastOn(): array
{
    return [
        new Channel('notifications'),
        new PrivateChannel('supervisor.' . $supervisorId),
    ];
}
```

**Frontend (Listener):**

```typescript
// In site-header.tsx
const channel = echo.private(`supervisor.${currentUser.id}`);
channel.listen('.AbsenceRequested', (e) => { ... });
```

#### Issue 6: Event Name Mismatch

**Symptom:** Channel connected but events not received

**Fix:** Event names must match (with leading dot on frontend):

**Backend:**

```php
public function broadcastAs(): string
{
    return 'AbsenceRequested'; // NO DOT
}
```

**Frontend:**

```typescript
channel.listen('.AbsenceRequested', ...); // WITH DOT
```

## Manual Testing Script

Run these commands in browser console (as Supervisor):

```javascript
// 1. Check Echo is loaded
console.log('Echo available:', !!window.Echo);

// 2. Check connection state
const state = window.Echo.connector?.pusher?.connection?.state;
console.log('Connection state:', state);

// 3. Force reconnect if needed
if (state !== 'connected') {
    window.Echo.connector.pusher.connect();
}

// 4. List active channels
console.log('Active channels:', Object.keys(window.Echo.connector.channels));

// 5. Manually subscribe to test
const testChannel = window.Echo.private('supervisor.1'); // Replace 1 with your ID
testChannel.listen('.AbsenceRequested', (e) => {
    console.log('🎉 TEST EVENT RECEIVED:', e);
    alert('Notification received! Badge should update.');
});

console.log('Test listener set up. Submit a form now.');
```

## Quick Fix Checklist

Run through this checklist:

- [ ] ✅ Reverb server is running (`php artisan reverb:start --debug`)
- [ ] ✅ Laravel server is running (`php artisan serve`)
- [ ] ✅ Frontend dev server is running (`npm run dev`)
- [ ] ✅ BROADCAST_CONNECTION=reverb in .env (uncommented)
- [ ] ✅ Vite environment variables match Reverb config
- [ ] ✅ Browser console shows "connection state: connected"
- [ ] ✅ Browser console shows "✅ Successfully subscribed"
- [ ] ✅ WebSocket connection visible in Network tab (WS filter)
- [ ] ✅ Supervisor is authenticated and logged in
- [ ] ✅ Channel authorization returns true for supervisor

## Expected Working Flow

**When everything works:**

1. **Reverb Terminal:** Shows new connection when supervisor logs in
2. **Browser Console (Supervisor):** Shows "connected" and "✅ Successfully subscribed"
3. **Network Tab:** Shows active WebSocket connection
4. **Employee submits form**
5. **Reverb Terminal:** Shows "Broadcasting event: AbsenceRequested"
6. **Browser Console (Supervisor):** Shows "Received AbsenceRequested event"
7. **UI Updates:** Badge increments, toast appears
8. **NO REFRESH NEEDED!** ✨

## Still Not Working?

If after all these steps it's still not working, run this diagnostic:

```bash
# 1. Clear all caches
php artisan optimize:clear
php artisan config:clear
php artisan cache:clear
php artisan view:clear

# 2. Restart Reverb
php artisan reverb:restart

# 3. Rebuild frontend
npm run build
# or
bun run build

# 4. Check Reverb config
php artisan config:show reverb

# 5. Test event manually
php artisan tinker
$absence = App\Models\Absence::first();
event(new App\Events\AbsenceRequested($absence));
# Watch Reverb terminal and browser console
```

## Get More Help

If issue persists, check:

1. Firewall blocking port 8080
2. Antivirus blocking WebSocket connections
3. Browser extensions blocking WebSockets
4. Try different browser
5. Try in incognito mode

Check Laravel logs:

```bash
tail -f storage/logs/laravel.log
```

Check Reverb specific logs:

```bash
# In Reverb terminal, all connection/broadcast info is shown with --debug
```
