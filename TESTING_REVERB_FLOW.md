# Testing Laravel Reverb Real-Time Notification Flow

## Prerequisites

Before testing, ensure:

1. ✅ Laravel Reverb is installed and configured
2. ✅ Environment variables are set (see LARAVEL_REVERB_SETUP.md)
3. ✅ Database is set up with employees and users
4. ✅ A supervisor user exists for testing

## Testing Steps

### 1. Start Required Services

Open multiple terminal windows:

**Terminal 1 - Laravel Development Server:**

```bash
php artisan serve
```

**Terminal 2 - Laravel Reverb Server:**

```bash
php artisan reverb:start --debug
```

**Terminal 3 - Frontend Development Server:**

```bash
npm run dev
# or
bun run dev
```

### 2. Open Browser and Monitor Console

1. Open your browser (Chrome/Firefox recommended for DevTools)
2. Navigate to the application URL (e.g., http://localhost:8000)
3. Open Developer Tools (F12)
4. Go to Console tab

### 3. Log in as Supervisor

1. Log in with a supervisor account
2. In the console, you should see:
    ```
    [Echo Config] Configuring Laravel Echo with Reverb...
    [Echo Config] ✅ Echo configured successfully with Reverb
    [Bell Notification] Setting up Echo listeners for user-specific notifications
    [Bell Notification] Echo connection state: connected
    [Bell Notification] ✅ Successfully subscribed to notification channel: supervisor.{id}
    ```

### 4. Open Second Browser/Incognito Window for Employee

1. Open a new browser window or incognito window
2. Navigate to employee login (e.g., http://localhost:8000/employee-view/login)
3. Log in as an employee
4. Open DevTools Console here too

### 5. Submit Absence Request

In the **Employee Window**:

1. Navigate to "Request Forms" → "Submit Absence Notification"
2. Fill out the form:
    - Select a date
    - Enter a reason (minimum 10 characters)
3. Click "Submit Absence Form"
4. Watch the console for:
    ```
    [Absence Form] Request submitted successfully
    [Absence Form] Echo is available
    [Absence Form] Echo connection state: connected
    ```

### 6. Verify Real-Time Notification

In the **Supervisor Window**:

Watch the console. You should see:

```
[Bell Notification] Received AbsenceRequested event: {...}
[Bell Notification] Event payload: {
  absence_id: 123,
  employee_name: "John Doe",
  department: "IT",
  ...
}
```

**And in the UI:**

- Bell icon badge should increment (e.g., from 0 to 1)
- A toast notification should appear: "Your absence request has been pending!"
- Click the bell icon to see the new notification in the dropdown
- **No page refresh required!**

### 7. Verify Reverb Server Logs

In **Terminal 2** (Reverb server), you should see:

```
[✔] Connection from client 1234-5678
[✔] Broadcasting event: App\Events\AbsenceRequested
[✔] Channels: notifications, private-supervisor.1
[✔] Message delivered to 2 clients
```

## Expected Results

### ✅ Success Indicators

1. **Frontend Console:**

    - Echo connection established
    - Channel subscribed successfully
    - Event received with correct payload

2. **UI Updates:**

    - Bell badge count increments automatically
    - Notification appears in dropdown
    - Toast notification displays
    - No page refresh needed

3. **Reverb Server:**

    - Connection established
    - Event broadcasted
    - Delivered to subscribed clients

4. **Network Tab:**
    - WebSocket connection shows as "101 Switching Protocols"
    - WebSocket frames show event data

## Troubleshooting

### ❌ Issue: Echo Connection State is "disconnected"

**Solution:**

1. Ensure Reverb server is running
2. Check REVERB_HOST and REVERB_PORT in .env
3. Verify firewall isn't blocking port 8080
4. Try: `php artisan reverb:restart`

### ❌ Issue: No Event Received

**Possible Causes:**

1. **Wrong channel subscription:**

    - Check `routes/channels.php` authorization
    - Verify supervisor ID matches

2. **Event not broadcasting:**

    - Check Reverb server logs for broadcast
    - Verify event implements `ShouldBroadcastNow`
    - Check `BROADCAST_CONNECTION=reverb` in .env

3. **Event name mismatch:**
    - Frontend listens for `.AbsenceRequested`
    - Backend broadcasts as `AbsenceRequested`
    - Note the leading dot in frontend

### ❌ Issue: CSRF Token Error

**Solution:**

1. Ensure `<meta name="csrf-token">` exists in HTML
2. Clear browser cache
3. Restart Laravel server
4. Check `getCSRFToken()` function returns valid token

### ❌ Issue: WebSocket Connection Failed

**Check:**

1. Reverb server is running on correct port
2. No other service using port 8080
3. VITE environment variables match REVERB variables
4. Try accessing http://127.0.0.1:8080 in browser

## Manual Testing Checklist

- [ ] Reverb server starts without errors
- [ ] Laravel server running
- [ ] Frontend dev server running
- [ ] Supervisor can log in
- [ ] Echo connection establishes (check console)
- [ ] Channel subscription succeeds (check console)
- [ ] Employee can log in
- [ ] Absence form loads correctly
- [ ] Form validation works
- [ ] Form submits successfully
- [ ] Event appears in Reverb logs
- [ ] Notification appears in supervisor UI (real-time)
- [ ] Bell badge increments automatically
- [ ] Toast notification displays
- [ ] Notification details are correct
- [ ] Clicking notification navigates correctly
- [ ] Mark as read functionality works
- [ ] No JavaScript errors in console

## Testing Different Scenarios

### Test Case 1: Multiple Supervisors

1. Create multiple supervisor accounts
2. Assign employees to different departments
3. Submit absence requests
4. Verify only relevant supervisor receives notification

### Test Case 2: Multiple Concurrent Submissions

1. Open multiple employee windows
2. Submit absence requests simultaneously
3. Verify all notifications arrive
4. Check for duplicate notifications (should not exist)

### Test Case 3: Connection Interruption

1. Start with working connection
2. Stop Reverb server
3. Submit absence request (should save to DB)
4. Restart Reverb server
5. Connection should auto-reconnect
6. Submit another request
7. Notification should work again

### Test Case 4: Page Refresh

1. Establish connection
2. Refresh supervisor page
3. Verify connection re-establishes
4. Submit absence request
5. Notification should still work

## Performance Monitoring

### Monitor Connection Health

In browser console:

```javascript
// Check connection state
console.log(window.Echo.connector.pusher.connection.state);

// Monitor connection events
window.Echo.connector.pusher.connection.bind('state_change', (states) => {
    console.log('Connection state:', states.previous, '->', states.current);
});
```

### Check for Memory Leaks

1. Open Performance/Memory tab in DevTools
2. Take heap snapshot before notifications
3. Receive multiple notifications
4. Take another heap snapshot
5. Compare - should not show significant growth

## Production Testing

Before deploying to production:

1. Test with SSL/TLS (wss://)
2. Verify reverse proxy configuration (Nginx)
3. Test with production Redis (if using for scaling)
4. Load test with multiple concurrent users
5. Monitor server resources under load
6. Test failover scenarios

## Debugging Commands

### Check Reverb Configuration

```bash
php artisan config:show reverb
```

### List Broadcasting Routes

```bash
php artisan route:list --path=broadcasting
```

### Test Event Broadcasting

```bash
php artisan tinker
$absence = \App\Models\Absence::first();
event(new \App\Events\AbsenceRequested($absence));
```

### Monitor Reverb Connections

```bash
# If using Redis for scaling
redis-cli MONITOR
```

## Success Metrics

Your implementation is working correctly when:

1. ✅ **Latency**: Notifications appear within 1-2 seconds of submission
2. ✅ **Reliability**: 100% of events are delivered to online supervisors
3. ✅ **No Duplicates**: Each event results in exactly one notification
4. ✅ **Persistence**: Connection auto-recovers after interruptions
5. ✅ **Scalability**: Works with multiple concurrent users
6. ✅ **UI Responsiveness**: No lag or freezing when receiving notifications

## Next Steps

After successful testing:

1. Set up monitoring for production (Laravel Pulse, Horizon)
2. Configure Supervisor process manager for Reverb
3. Set up log rotation for Reverb logs
4. Implement error tracking (Sentry, Bugsnag)
5. Document for team members
6. Train supervisors on new real-time features

## Need Help?

Refer to:

- `LARAVEL_REVERB_SETUP.md` - Complete setup documentation
- Laravel Reverb Docs: https://laravel.com/docs/12.x/reverb
- Check console logs for specific error messages
- Verify all steps in order
