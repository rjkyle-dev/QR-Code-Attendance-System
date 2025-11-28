# Fix: "No matching application for ID [309696]"

## Problem

The error `Pusher error: No matching application for ID [309696]` occurs because:

1. The Reverb server was started before the environment variables were properly set
2. The Reverb server configuration didn't match the broadcasting configuration
3. The Reverb server needs to be restarted to load the new configuration

## What Was Fixed

### 1. `config/reverb.php`

- ✅ Fixed port default from `443` to `8080` to match broadcasting config
- ✅ Fixed scheme default from `https` to `http` to match broadcasting config
- ✅ Added fallback empty strings to prevent null errors
- ✅ Added proper type casting for port

### 2. `config/broadcasting.php`

- ✅ Changed default broadcaster back to `reverb` (was `null`)

## Solution Steps

### Step 1: Verify .env File

Make sure your `.env` file has these variables (no quotes, no spaces around `=`):

```env
BROADCAST_CONNECTION=reverb

REVERB_APP_ID=309696
REVERB_APP_KEY=ssrvdbuy9wibf3wqvyll
REVERB_APP_SECRET=fydclarjwn3yqrwbzgdz
REVERB_HOST=localhost
REVERB_PORT=8080
REVERB_SCHEME=http

VITE_REVERB_APP_KEY=ssrvdbuy9wibf3wqvyll
VITE_REVERB_HOST=localhost
VITE_REVERB_PORT=8080
VITE_REVERB_SCHEME=http
```

### Step 2: Clear Config Cache

```bash
php artisan config:clear
php artisan cache:clear
```

### Step 3: Restart Reverb Server

**IMPORTANT:** You MUST restart the Reverb server for it to recognize the application ID.

1. **Stop the current Reverb server** (if running):

    - Find the process using port 8080 and stop it
    - Or press `Ctrl+C` in the terminal where Reverb is running

2. **Start Reverb server again**:

    ```bash
    php artisan reverb:start
    ```

    Or with debugging:

    ```bash
    php artisan reverb:start --debug
    ```

### Step 4: Verify Configuration

After restarting, the Reverb server should:

- Load the application with ID `309696`
- Listen on port `8080`
- Use `http` scheme (not https)

## Why This Happens

The Reverb server reads its configuration when it starts. If you:

1. Start Reverb server
2. Then add/change environment variables
3. The server won't know about the changes until you restart it

The server needs to be restarted every time you change:

- `REVERB_APP_ID`
- `REVERB_APP_KEY`
- `REVERB_APP_SECRET`
- `REVERB_HOST`
- `REVERB_PORT`
- `REVERB_SCHEME`

## Testing

After restarting the Reverb server, try submitting an absence request again. The error should be resolved and the event should broadcast successfully.

You can verify the Reverb server is working by checking the server logs - you should see connection and broadcast messages when events are fired.
