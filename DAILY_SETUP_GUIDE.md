# 🎥 Daily.co Video Calling Setup Guide

## 📋 Quick Setup Steps

### 1. Create Daily.co Account
1. Go to [https://www.daily.co/](https://www.daily.co/)
2. Sign up for a **FREE** account
3. Verify your email address

### 2. Get API Credentials
1. Login to your Daily.co dashboard
2. Go to **Developers** → **API Keys**
3. Copy your **API Key**
4. Note your **Domain** (e.g., `yourcompany.daily.co`)

### 3. Configure Environment Variables
Open `server/.env` file and update:

```env
# Daily.co Configuration (for video calls)
DAILY_API_KEY=your_actual_api_key_here
DAILY_DOMAIN=your_actual_domain_here
```

**Example:**
```env
DAILY_API_KEY=abc123def456ghi789jkl012mno345pqr678stu901vwx234yz
DAILY_DOMAIN=tutormatch
```

### 4. Restart Your Server
```bash
cd server
npm run dev
```

## ✅ Verification Steps

### 1. Check Server Logs
Look for this message when server starts:
```
✅ Daily.co service configured successfully
```

### 2. Test Video Room Creation
1. Login as a **tutor**
2. Go to an **approved session**
3. Click **"Start Video Session"**
4. Should create real Daily.co room (not mock)

### 3. Test Video Calling
1. **Tutor** starts video session
2. **Student** joins the same session
3. Both should see real video interface
4. Camera/microphone controls should work

## 🔧 Troubleshooting

### Issue: Still seeing "mock" or "your_daily_domain" in URLs
**Solution:** 
- Check `.env` file has correct values
- Restart server completely
- Clear browser cache

### Issue: "Video service not configured" error
**Solution:**
- Verify API key is correct
- Check Daily.co dashboard for API key status
- Ensure no extra spaces in `.env` file

### Issue: 404 errors when joining rooms
**Solution:**
- Verify domain name is correct
- Check Daily.co account is active
- Ensure API key has room creation permissions

## 📞 Daily.co Free Plan Limits
- ✅ **Unlimited 1-on-1 calls** (perfect for tutoring)
- ✅ **Up to 20 participants** in group calls
- ✅ **No time limits**
- ✅ **Screen sharing**
- ✅ **Recording** (with API)

## 🎯 Expected Behavior After Setup

### ✅ Working Video Calls:
- Real Daily.co rooms created
- Actual video/audio streaming
- Screen sharing functionality
- Professional video interface
- Proper call controls

### ✅ Real-time Features:
- Tutor creates video room
- Student receives real-time notification
- Both join same video session
- Live video communication

## 🚀 Production Deployment

For production, consider:
1. **Paid Daily.co plan** for advanced features
2. **Custom domain** for branding
3. **Recording storage** setup
4. **Analytics** integration

---

**Need Help?** 
- Daily.co Documentation: https://docs.daily.co/
- Daily.co Support: https://help.daily.co/
