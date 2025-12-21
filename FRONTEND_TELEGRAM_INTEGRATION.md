# Frontend Telegram Integration - Implementation Guide

## Overview

This document describes the frontend implementation for the Telegram connection flow. Users can now connect their Telegram account (direct messages or group chats) to receive instant crypto transaction alerts.

## What Was Implemented

### 1. New Files Created

#### `src/lib/api.ts`
- Centralized API client for backend communication
- Handles authentication via Bearer token from Supabase session
- Error handling with custom `ApiError` class
- Methods:
  - `api.telegram.createConnectToken(token, destination)` - Generates one-time connection token
  - `api.telegram.getStatus(token)` - Fetches current Telegram connection status
  - `api.notificationChannels.getAll(token)` - Gets all notification channels (extensible)

#### `src/components/TelegramConnect.tsx`
- Reusable component for Telegram connection UI
- Features:
  - Shows connection status (connected/not connected)
  - Two-button interface: "Connect Direct" and "Connect Group"
  - Mobile detection: redirects directly on mobile, opens new tab on desktop
  - Auto-polling after connection attempt (checks every 3 seconds for up to 60 seconds)
  - Manual "Check Status Now" button
  - Error handling with clear user-friendly messages
  - Loading states for all async operations
  - Shows chat title when connected

#### `src/pages/NotificationSettings.tsx`
- New dedicated page for notification channel management
- Displays Telegram connection component
- Placeholder cards for Email and Webhooks (coming soon)
- Mobile-first responsive design
- Accessible via main menu

### 2. Modified Files

#### `src/App.tsx`
- Added import for `NotificationSettings` page
- Added route: `/notifications` (protected route)

#### `src/components/Header.tsx`
- Added "Notifications" link to hamburger menu
- Positioned between "Dashboard" and "Billing"

#### `src/pages/Dashboard.tsx`
- Added notification status card showing:
  - Telegram connection status
  - Visual indicator (green checkmark when connected, blue bell when not)
  - Quick link to notifications page
- Loads Telegram status on dashboard mount
- Non-blocking: if API fails, dashboard still works

#### `.env` and `.env.example`
- Added `VITE_API_URL` environment variable
- Defaults to `http://localhost:3000` for development

## User Flow

### Connection Flow (First Time)

1. **User navigates to Notifications**
   - From hamburger menu → Notifications
   - OR from dashboard → click notification status card

2. **User sees Telegram card** with two options:
   - "Connect Direct" - for 1-on-1 bot messages
   - "Connect Group" - for group/supergroup alerts

3. **User clicks a connect button**
   - Frontend calls backend API to generate one-time token
   - Backend returns deep link (e.g., `https://t.me/BotName?start=TOKEN`)
   - Frontend detects device:
     - **Mobile**: `window.location.href = deepLink` (seamless redirect)
     - **Desktop**: `window.open(deepLink, '_blank')` (new tab)

4. **User opens Telegram**
   - Mobile: automatically switches to Telegram app
   - Desktop: Telegram web or desktop app opens
   - User sees bot with "START" button

5. **User presses START**
   - Telegram sends `/start TOKEN` to backend webhook
   - Backend validates token and links chat_id to user
   - Backend sends confirmation message in Telegram

6. **User returns to app**
   - Page shows "Waiting for confirmation..." with auto-polling
   - Checks status every 3 seconds (max 20 attempts = 60 seconds)
   - When connection detected:
     - Status updates to "Connected"
     - Shows green checkmark and chat type/title
     - Dashboard notification card updates automatically on next visit

### Reconnection Flow (Switching Destination)

1. **User is already connected**
   - Card shows "Connected" status with current destination

2. **User wants to switch** (e.g., from direct to group)
   - Clicks "Change to Direct" or "Change to Group" buttons
   - Same flow as initial connection
   - **Important**: Only ONE destination is active at a time
   - New connection overwrites the previous one

### Status Checking

- **Automatic on page load**: Status is fetched when NotificationSettings page loads
- **Auto-polling**: After connection attempt, checks every 3 seconds
- **Manual refresh**: User can click "Check Status Now" button
- **Dashboard widget**: Shows quick status without full page load

## Configuration

### Environment Variables

Create or update `.env` file in project root:

```env
# Supabase (already configured)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key

# Backend API URL
VITE_API_URL=http://localhost:3000
```

**For production:**
```env
VITE_API_URL=https://api.yourdomain.com
```

**For different environments:**
- Development: `http://localhost:3000`
- Staging: `https://api-staging.yourdomain.com`
- Production: `https://api.yourdomain.com`

### Backend Endpoints Used

The frontend expects these endpoints (already implemented in backend):

| Endpoint | Method | Auth | Purpose |
|----------|--------|------|---------|
| `/telegram/connect-token` | POST | Required | Generate connection token |
| `/telegram/status` | GET | Required | Check connection status |
| `/notification-channels` | GET | Required | List all channels (future) |

**Request/Response Examples:**

**POST /telegram/connect-token**
```json
// Request
{
  "destination": "direct"  // or "group"
}

// Response
{
  "token": "abc123...def456",
  "telegram_url": "https://t.me/BotUsername?start=abc123...def456"
}
```

**GET /telegram/status**
```json
// Response (connected)
{
  "connected": true,
  "destination": "direct",  // or "group"
  "chat_title": "John Doe"
}

// Response (not connected)
{
  "connected": false,
  "destination": null
}
```

## Running the Application

### Development

```bash
# Terminal 1: Start backend API
cd backend
npm run dev

# Terminal 2: Start frontend
cd /path/to/project
npm run dev
```

Access at: `http://localhost:5173`

### Building for Production

```bash
# Build frontend
npm run build

# Preview build
npm run preview
```

### Deployment

1. **Build the frontend:**
   ```bash
   npm run build
   ```

2. **Set production environment variable:**
   ```env
   VITE_API_URL=https://api.yourdomain.com
   ```

3. **Deploy `dist/` folder** to your hosting service:
   - Vercel
   - Netlify
   - AWS S3 + CloudFront
   - Any static hosting

4. **Important**: Ensure backend API is accessible from frontend domain (CORS configured)

## Testing Checklist

### Manual Testing Steps

1. **Test Authentication**
   - [ ] Log in to the app
   - [ ] Session token is present in AuthContext

2. **Test Navigation**
   - [ ] Dashboard loads without errors
   - [ ] Notification status card visible on dashboard
   - [ ] Click hamburger menu → "Notifications" appears
   - [ ] Click "Notifications" → NotificationSettings page loads

3. **Test Telegram Connection - Direct**
   - [ ] Click "Connect Direct" button
   - [ ] Loading spinner appears
   - [ ] Deep link opens (Telegram opens on mobile, new tab on desktop)
   - [ ] "Waiting for confirmation..." message appears
   - [ ] Press START in Telegram
   - [ ] Return to app
   - [ ] Status updates to "Connected" (within 60 seconds)
   - [ ] Chat title displays correctly

4. **Test Telegram Connection - Group**
   - [ ] Click "Connect Group" button
   - [ ] Telegram opens with group selection
   - [ ] Add bot to group
   - [ ] Bot sends `/start TOKEN` automatically
   - [ ] Return to app
   - [ ] Status updates to "Connected"
   - [ ] Shows group name

5. **Test Switching Destination**
   - [ ] Already connected as Direct
   - [ ] Click "Change to Group"
   - [ ] Old connection is replaced
   - [ ] New connection works

6. **Test Dashboard Integration**
   - [ ] Navigate back to Dashboard
   - [ ] Notification card shows "Connected" status
   - [ ] Green checkmark visible
   - [ ] Click card → navigates to NotificationSettings

7. **Test Error Handling**
   - [ ] Backend offline → shows error message
   - [ ] Invalid token → shows error message
   - [ ] Expired token → shows error message
   - [ ] Network error → shows error message

### API Integration Testing

```bash
# Test backend is reachable
curl http://localhost:3000/health

# Test with valid JWT (get token from browser devtools)
curl http://localhost:3000/telegram/connect-token \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"destination": "direct"}'

# Should return:
# {"token":"...","telegram_url":"https://t.me/..."}
```

## Troubleshooting

### Issue: "Failed to fetch" error

**Cause**: Backend is not running or VITE_API_URL is incorrect

**Solution**:
1. Check backend is running: `curl http://localhost:3000/health`
2. Verify `.env` file has correct `VITE_API_URL`
3. Restart frontend dev server after changing `.env`

### Issue: "Authentication required" error

**Cause**: Session token is missing or expired

**Solution**:
1. Log out and log back in
2. Check browser console for auth errors
3. Verify Supabase auth is working

### Issue: Telegram doesn't open on mobile

**Cause**: Deep link not recognized or Telegram not installed

**Solution**:
1. Ensure Telegram app is installed
2. Try opening link manually
3. Check browser console for errors

### Issue: Status never updates to "Connected"

**Cause**: Backend webhook not receiving Telegram updates, or token validation failed

**Solution**:
1. Check backend logs: `sudo journalctl -u simplecryptomonitor-api -f`
2. Verify webhook is configured: `curl https://api.telegram.org/bot<TOKEN>/getWebhookInfo`
3. Ensure token hasn't expired (10 minutes max)
4. Try generating a new token

### Issue: "Telegram bot not configured" error

**Cause**: Backend environment variables missing

**Solution**:
1. Check backend `.env` has:
   - `TELEGRAM_BOT_TOKEN`
   - `TELEGRAM_BOT_USERNAME`
2. Restart backend API

### Issue: CORS errors in browser console

**Cause**: Backend CORS not configured for frontend domain

**Solution**:
1. Backend should allow origin: your frontend URL
2. Check backend `src/index.ts` has CORS middleware
3. For production, whitelist specific domains

## Design Decisions

### Why polling instead of WebSocket?

- **Simplicity**: Polling is easier to implement and debug
- **Reliability**: Works with any network/firewall configuration
- **Short duration**: Only polls for 60 seconds max
- **Low frequency**: 3-second interval is acceptable

Future improvement: Real-time updates via WebSocket or Server-Sent Events.

### Why separate NotificationSettings page?

- **Scalability**: Easy to add more notification channels (Email, Webhooks, SMS)
- **Focus**: Dedicated page for notification management
- **Discoverability**: Clear navigation from menu and dashboard

### Why show status on Dashboard?

- **Visibility**: Users immediately see if notifications are configured
- **Onboarding**: Encourages new users to set up alerts
- **Quick access**: One-click to notification settings

### Mobile-first design

- All components responsive
- Touch-friendly button sizes
- Mobile redirect for seamless Telegram opening
- Works perfectly on iOS and Android

## Future Enhancements

1. **Email notifications**
   - Add email verification flow
   - Email preferences (frequency, digest)

2. **Webhooks**
   - Custom endpoint configuration
   - Payload templates
   - Test webhook button

3. **Real-time updates**
   - WebSocket connection
   - Instant status updates without polling

4. **Notification preferences**
   - Per-wallet notification settings
   - Min amount filters
   - Direction filters (incoming/outgoing)

5. **Multiple Telegram destinations**
   - Support both direct AND group simultaneously
   - Priority/fallback configuration

## Security Considerations

- ✅ All API calls require authentication (Bearer token)
- ✅ Tokens are one-time use only
- ✅ Tokens expire after 10 minutes
- ✅ No sensitive data stored in frontend
- ✅ Session token stored securely by Supabase Auth
- ✅ HTTPS required in production
- ✅ CORS properly configured on backend

## Architecture Notes

### State Management

- **Local state** in components (useState)
- **Auth state** in AuthContext (Supabase session)
- **No global state library** (Redux, Zustand) needed yet
- Clean, simple, maintainable

### API Client Pattern

- Centralized in `src/lib/api.ts`
- Easy to extend for new endpoints
- Consistent error handling
- Type-safe with TypeScript

### Component Structure

```
src/
├── components/
│   ├── TelegramConnect.tsx    # Reusable Telegram UI
│   ├── Header.tsx              # Updated with nav link
│   └── ...
├── pages/
│   ├── NotificationSettings.tsx  # New page
│   ├── Dashboard.tsx             # Updated with status card
│   └── ...
├── lib/
│   ├── api.ts                 # New API client
│   └── supabase.ts           # Existing
└── contexts/
    └── AuthContext.tsx        # Existing
```

## Support

For issues or questions:
1. Check backend logs: `sudo journalctl -u simplecryptomonitor-api -f`
2. Check browser console for frontend errors
3. Verify environment variables are set correctly
4. Review `backend/TELEGRAM_SETUP.md` for backend-specific issues

## Summary

The Telegram integration is now fully functional in the frontend:
- ✅ Users can connect Telegram (direct or group)
- ✅ Connection status visible on dashboard and settings page
- ✅ Mobile-friendly with automatic app switching
- ✅ Auto-polling for status updates
- ✅ Clear error messages
- ✅ No database writes from frontend (backend API only)
- ✅ Consistent with existing design system
- ✅ Production-ready
