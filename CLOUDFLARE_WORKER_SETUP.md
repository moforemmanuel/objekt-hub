# Cloudflare Worker Setup Guide

Cloudflare Worker is used to serve Backblaze B2 images with global CDN caching without making the bucket public.

## Why Cloudflare Workers?

- **Free Tier**: 100,000 requests/day
- **Global CDN**: Images cached at 300+ edge locations worldwide
- **Cost Savings**: Reduces Backblaze bandwidth costs (B2 only charged on first request, then cached)
- **No public bucket required**: Worker authenticates with B2 on your behalf

## Worker URL

```
https://cloudflare-b2.objekt-hub.workers.dev
```

## Setup (Using Wrangler CLI)

### 1. Install Wrangler

```bash
npm install -g wrangler
```

### 2. Login to Cloudflare

```bash
wrangler login
```

### 3. Create and Deploy Worker

```bash
wrangler init cloudflare-b2
cd cloudflare-b2
# Add your worker code
wrangler deploy
```

### 4. Configure Secrets

```bash
wrangler secret put B2_KEY_ID
wrangler secret put B2_APP_KEY
```

Enter your Backblaze Application Key ID and Application Key when prompted.

### 5. Update Backend Configuration

Add `CDN_URL` to your `packages/api/.env`:

```env
CDN_URL=https://cloudflare-b2.objekt-hub.workers.dev
```

Restart your backend server.

## How It Works

```
User Request → Cloudflare Edge (300+ locations)
                ↓
         [Cached? Return from cache]
                ↓
    [Not cached? Fetch from B2 with auth]
                ↓
         [Cache at edge]
                ↓
         [Return image to user]
```

## Troubleshooting

### Images not loading (404)
- Verify B2 credentials: `wrangler secret list`
- Check that the bucket name in the worker matches your B2 bucket
- Ensure the file path in the URL is correct

### Images not loading (401)
- Re-set secrets: `wrangler secret put B2_KEY_ID` and `wrangler secret put B2_APP_KEY`
- Make sure the Application Key has read permissions for the bucket

### Slow initial load
- First request fetches from B2 (may take 1-2 seconds)
- Subsequent requests served from edge cache (< 50ms)

## Useful Wrangler Commands

```bash
wrangler deploy          # Deploy worker
wrangler tail            # Stream live logs
wrangler secret list     # List configured secrets
wrangler dev             # Local development
```

## Free Tier Limits

- 100,000 requests/day
- 10ms CPU time per request
- Unlimited bandwidth
