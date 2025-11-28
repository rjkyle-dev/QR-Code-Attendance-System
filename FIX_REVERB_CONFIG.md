# Fix for Pusher\Pusher TypeError

## Problem

The error `Pusher\Pusher::__construct(): Argument #1 ($auth_key) must be of type string, null given` occurs because the REVERB environment variables are missing from your `.env` file.

## Solution

### Step 1: Add REVERB Variables to .env

Add these lines to your `.env` file (make sure they're NOT commented out and have NO quotes):

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

**Important:**

- No quotes around values (e.g., `REVERB_HOST=localhost` NOT `REVERB_HOST="localhost"`)
- No spaces around the `=` sign
- Make sure `BROADCAST_CONNECTION=reverb` is set (not commented out)

### Step 2: Clear All Caches

After updating your `.env` file, run these commands:

```bash
php artisan config:clear
php artisan cache:clear
php artisan optimize:clear
```

### Step 3: Verify Configuration

Test that the config is loaded correctly:

```bash
php artisan config:show broadcasting.connections.reverb
```

You should see:

- `key` = `ssrvdbuy9wibf3wqvyll`
- `secret` = `fydclarjwn3yqrwbzgdz`
- `app_id` = `309696`
- `options.host` = `localhost`
- `options.port` = `8080`
- `options.scheme` = `http`

## What Was Fixed

1. ✅ Added fallback empty strings (`?: ''`) to prevent null errors
2. ✅ Fixed port type casting to integer
3. ✅ Set correct defaults for host, port, and scheme
4. ✅ Config now handles missing env variables gracefully

## Next Steps

1. Add the REVERB variables to your `.env` file
2. Clear all caches
3. Test the configuration
4. Start the Reverb server: `php artisan reverb:start`

The error should be resolved once the environment variables are properly set in your `.env` file.
