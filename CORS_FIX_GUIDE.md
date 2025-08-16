# CORS Fix Guide for State Manager Frontend

## Problem
You're encountering a CORS (Cross-Origin Resource Sharing) error:
```
Response to preflight request doesn't pass access control check: No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

This happens because the State Manager backend doesn't have CORS headers configured to allow requests from the frontend.

## Solution

I've added CORS support to the State Manager backend. Here's how to apply the fix:

### 1. ✅ CORS Configuration Added

The following changes have been made to the State Manager:

#### `state-manager/app/main.py`
- Added `CORSMiddleware` import
- Added CORS middleware configuration
- Uses secure CORS settings

#### `state-manager/app/config/cors.py` (NEW)
- Configurable CORS origins
- Environment variable support
- Secure default settings

### 2. 🔄 Restart the State Manager

You need to restart the State Manager backend for the CORS changes to take effect:

#### Option A: Manual Restart
```bash
# Stop the current state manager (if running)
# Then restart it:
cd state-manager
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

#### Option B: Use the Restart Script
```bash
cd state-manager
python restart_with_cors.py
```

### 3. 🌐 Test the Frontend

Once the State Manager is restarted with CORS support:

1. Make sure your frontend is running: `npm run dev`
2. Open http://localhost:3000
3. Try the workflow - CORS errors should be resolved

### 4. 🔧 Environment Configuration (Optional)

For production, you can configure specific CORS origins:

#### Backend Environment Variables
```bash
# In your state-manager environment
CORS_ORIGINS=http://localhost:3000,https://yourdomain.com
```

#### Frontend Environment
Create `.env.local` in the frontend directory:
```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

## CORS Configuration Details

### Development Settings (Current)
- **Origins**: `http://localhost:3000`, `http://localhost:3001`, `http://127.0.0.1:3000`, `http://127.0.0.1:3001`
- **Methods**: GET, POST, PUT, DELETE, OPTIONS, PATCH
- **Headers**: Content-Type, X-API-Key, Authorization, etc.
- **Credentials**: Allowed

### Production Settings (Recommended)
```python
# In production, replace the CORS configuration with:
CORS_ORIGINS=https://yourdomain.com,https://app.yourdomain.com
```

## Troubleshooting

### If CORS errors persist:

1. **Check State Manager is running**:
   ```bash
   curl http://localhost:8000/health
   ```

2. **Verify CORS headers**:
   ```bash
   curl -H "Origin: http://localhost:3000" \
        -H "Access-Control-Request-Method: POST" \
        -H "Access-Control-Request-Headers: X-API-Key" \
        -X OPTIONS http://localhost:8000/v0/namespace/testnamespace/nodes/
   ```

3. **Check browser console** for specific CORS error details

4. **Verify environment variables** are set correctly

### Common Issues:

- **State Manager not restarted**: CORS changes require a restart
- **Wrong port**: Ensure frontend is on port 3000 and backend on 8000
- **Firewall/Network issues**: Check if ports are accessible

## Security Notes

### Development
- Current settings allow all origins (`*`) for easy development
- This is fine for local development

### Production
- Always specify exact origins in `CORS_ORIGINS`
- Never use `allow_origins=["*"]` in production
- Consider using environment-specific configurations

## Next Steps

1. ✅ Restart the State Manager backend
2. ✅ Test the frontend workflow
3. ✅ Verify CORS errors are resolved
4. 🚀 Enjoy your fully functional State Manager frontend!

The frontend should now be able to communicate with the State Manager backend without CORS issues.
