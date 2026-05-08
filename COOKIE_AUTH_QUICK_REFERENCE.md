# 🔐 Cookie-Based Auth - Quick Reference

## 📝 Summary of Changes

### Backend (2 files modified)

#### 1. `Backend/middleware/auth.js`
```javascript
// ❌ BEFORE: Token in response body
res.status(statusCode).json({
  status: 'success',
  token,  // Exposed to JavaScript
  data: { user },
});

// ✅ AFTER: Token only in cookie
res.status(statusCode).json({
  status: 'success',
  data: { user },  // No token in body
});
```

#### 2. `Backend/app.js`
```javascript
// ✅ Enhanced CORS for production
const allowedOrigins = process.env.CLIENT_URL 
  ? process.env.CLIENT_URL.split(',').map(url => url.trim())
  : ['http://localhost:5173', 'http://localhost:3000'];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin) || process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  exposedHeaders: ['Set-Cookie'],
  maxAge: 86400,
}));
```

### Frontend (0 files modified)
✅ Already configured correctly with `credentials: "include"`

---

## 🔑 Environment Variables

```env
# Required
NODE_ENV=production
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
JWT_EXPIRES_IN_DAYS=7
CLIENT_URL=https://yourdomain.com

# Multiple origins (comma-separated)
CLIENT_URL=https://yourdomain.com,https://www.yourdomain.com
```

---

## 🧪 Testing Commands

### Test Login
```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@ecom.dev","password":"admin1234"}' \
  -c cookies.txt -v
```

### Test Protected Route
```bash
curl -X GET http://localhost:5000/api/v1/users/me \
  -b cookies.txt -v
```

### Test Logout
```bash
curl -X POST http://localhost:5000/api/v1/auth/logout \
  -b cookies.txt -c cookies.txt -v
```

---

## 🔒 Security Checklist

- [x] Token in HTTP-only cookie (not accessible to JavaScript)
- [x] Secure flag enabled in production (HTTPS only)
- [x] SameSite attribute set (CSRF protection)
- [x] CORS properly configured with credentials
- [x] Token not in response body
- [x] Frontend uses `credentials: "include"`
- [x] Cookie expires after 7 days
- [x] Password change invalidates tokens

---

## 🚀 Deployment Steps

### 1. Update Environment Variables
```bash
# Production .env
NODE_ENV=production
CLIENT_URL=https://yourdomain.com
JWT_SECRET=<generate-strong-secret>
```

### 2. Verify HTTPS
```bash
# Backend must be served over HTTPS in production
# Cookies with secure flag won't work over HTTP
```

### 3. Test in Browser
1. Login at your frontend
2. Open DevTools → Application → Cookies
3. Verify `jwt` cookie has:
   - ✅ HttpOnly
   - ✅ Secure (if HTTPS)
   - ✅ SameSite

---

## 🐛 Common Issues

| Issue | Solution |
|-------|----------|
| Cookies not set | Check CORS `credentials: true` on both ends |
| CORS errors | Add frontend URL to `CLIENT_URL` env var |
| Cookies not sent | Ensure `credentials: "include"` in fetch |
| 401 errors | Check cookie expiration and JWT_SECRET |

---

## 📊 Before vs After

| Aspect | Before | After |
|--------|--------|-------|
| Token storage | Cookie + JSON body | Cookie only |
| JavaScript access | ✅ Yes (vulnerable) | ❌ No (secure) |
| XSS risk | ⚠️ High | ✅ Protected |
| CSRF risk | ⚠️ Medium | ✅ Protected |
| CORS config | Basic | Production-ready |

---

## 💡 Key Takeaways

1. **No frontend changes needed** - already using `credentials: "include"`
2. **Backend changes minimal** - removed token from response body
3. **Security improved** - token no longer accessible to JavaScript
4. **No breaking changes** - all existing functionality preserved
5. **Production ready** - proper CORS and cookie configuration

---

## 📞 Support

If you encounter issues:
1. Check `COOKIE_AUTH_MIGRATION.md` for detailed troubleshooting
2. Verify environment variables are set correctly
3. Test with curl commands above
4. Check browser DevTools → Network → Cookies
