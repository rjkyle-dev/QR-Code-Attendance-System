# Laravel Reverb Setup for Real-time Notifications

## Environment Variables Required

Add these variables to your `.env` file:

```env
# Laravel Echo Reverb Configuration (Frontend)
VITE_REVERB_APP_KEY=your-reverb-app-key
VITE_REVERB_HOST=localhost
VITE_REVERB_PORT=8080

# Laravel Reverb Configuration (Backend)
BROADCAST_CONNECTION=reverb
REVERB_APP_KEY=your-reverb-app-key
REVERB_APP_SECRET=your-reverb-app-secret
REVERB_APP_ID=your-reverb-app-id
REVERB_HOST=localhost
REVERB_PORT=8080
REVERB_SCHEME=http
```

## Starting Reverb Server

Run this command to start the Reverb WebSocket server:

```bash
php artisan reverb:start
```

## Testing Real-time Notifications

1. Open two browser windows
2. In the first window, log in as a high-position user (Super Admin, HR, Manager, or Supervisor)
3. In the second window, log in as an employee
4. Submit a leave or absence request from the employee window
5. The notification should appear immediately in the first window without refresh

## How It Works

1. **Events**: When an employee submits a request, `LeaveRequested` or `AbsenceRequested` events are fired
2. **Broadcasting**: These events are broadcast to the `notifications` channel using Reverb
3. **Frontend Listening**: The dashboard and header components listen to these channels
4. **Real-time Updates**: Notifications appear instantly without page refresh

## Troubleshooting

- Ensure Reverb server is running (`php artisan reverb:start`)
- Check browser console for WebSocket connection errors
- Verify environment variables are set correctly
- Make sure the `notifications` channel is accessible to authenticated users
