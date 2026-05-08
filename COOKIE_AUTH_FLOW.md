# 🔐 Cookie-Based Authentication Flow

## 📊 Visual Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         COOKIE-BASED AUTH FLOW                              │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────────┐                                              ┌──────────────┐
│   Browser    │                                              │   Backend    │
│  (Frontend)  │                                              │   (Express)  │
└──────┬───────┘                                              └──────┬───────┘
       │                                                             │
       │  ① POST /api/v1/auth/login                                 │
       │     { email, password }                                    │
       │ ──────────────────────────────────────────────────────────>│
       │                                                             │
       │                                        ② Verify credentials│
       │                                        ③ Generate JWT      │
       │                                        ④ Set HTTP-only     │
       │                                           cookie           │
       │                                                             │
       │  ⑤ Set-Cookie: jwt=<token>;                                │
       │     HttpOnly; Secure; SameSite=strict                      │
       │     { status: "success", data: { user } }                  │
       │ <──────────────────────────────────────────────────────────│
       │                                                             │
       │  ⑥ Browser stores cookie                                   │
       │     (NOT accessible to JavaScript)                         │
       │                                                             │
       │  ⑦ GET /api/v1/users/me                                    │
       │     Cookie: jwt=<token>                                    │
       │ ──────────────────────────────────────────────────────────>│
       │                                                             │
       │                                        ⑧ Verify JWT        │
       │                                        ⑨ Attach user to    │
       │                                           req.user          │
       │                                                             │
       │  ⑩ { status: "success", data: { user } }                   │
       │ <──────────────────────────────────────────────────────────│
       │                                                             │
       │  ⑪ POST /api/v1/auth/logout                                │
       │     Cookie: jwt=<token>                                    │
       │ ──────────────────────────────────────────────────────────>│
       │                                                             │
       │                                        ⑫ Clear cookie      │
       │                                                             │
       │  ⑬ Set-Cookie: jwt=logged-out;                             │
       │     expires=<past-date>                                    │
       │     { status: "success" }                                  │
       │ <──────────────────────────────────────────────────────────│
       │                                                             │
       │  ⑭ Browser deletes cookie                                  │
       │                                                             │
```

---

## 🔍 Detailed Step-by-Step

### 1️⃣ Login Request
```javascript
// Frontend
fetch('/api/v1/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password }),
  credentials: 'include',  // ✅ Essential for cookies
});
```

### 2️⃣ Backend Verification
```javascript
// Backend: authService.js
const user = await User.findOne({ email })
  .select('+password +active')
  .setOptions({ includeInactive: true });

if (!user || !(await user.correctPassword(password, user.password))) {
  return next(new AppError('Invalid credentials', 401));
}

if (user.status === 'suspended') {
  return next(new AppError('Account suspended', 403));
}
```

### 3️⃣ JWT Generation
```javascript
// Backend: middleware/auth.js
const signToken = (id) =>
  jwt.sign({ id }, config.jwtSecret, { 
    expiresIn: config.jwtExpiresIn 
  });

const token = signToken(user._id);
```

### 4️⃣ Set HTTP-Only Cookie
```javascript
// Backend: middleware/auth.js
const cookieOptions = {
  expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  httpOnly: true,  // ✅ JavaScript cannot access
  secure: process.env.NODE_ENV === 'production',  // ✅ HTTPS only
  sameSite: 'strict',  // ✅ CSRF protection
};

res.cookie('jwt', token, cookieOptions);
```

### 5️⃣ Response (No Token in Body)
```javascript
// Backend: middleware/auth.js
res.status(200).json({
  status: 'success',
  data: { user },  // ✅ No token here!
});
```

### 6️⃣ Browser Stores Cookie
```
HTTP Response Headers:
Set-Cookie: jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...; 
            HttpOnly; 
            Secure; 
            SameSite=Strict; 
            Expires=Thu, 15 May 2025 12:00:00 GMT
```

### 7️⃣ Subsequent Requests
```javascript
// Frontend - Cookie sent automatically
fetch('/api/v1/users/me', {
  credentials: 'include',  // ✅ Browser sends cookie
});
```

### 8️⃣ Backend Verification
```javascript
// Backend: middleware/auth.js
const protect = catchAsync(async (req, res, next) => {
  // Extract token from cookie
  let token;
  if (req.cookies && req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return next(new AppError('Not authenticated', 401));
  }

  // Verify token
  const decoded = await promisify(jwt.verify)(token, config.jwtSecret);
  
  // Get user
  const user = await User.findById(decoded.id);
  
  // Attach to request
  req.user = user;
  next();
});
```

### 9️⃣ Logout
```javascript
// Backend: authService.js
const logout = (res) => {
  res.cookie('jwt', 'logged-out', {
    expires: new Date(Date.now() + 5 * 1000),  // 5 seconds
    httpOnly: true,
    sameSite: 'strict',
  });
  
  res.status(200).json({ 
    status: 'success', 
    message: 'Logged out' 
  });
};
```

---

## 🔒 Security Layers

```
┌─────────────────────────────────────────────────────────────┐
│                    SECURITY LAYERS                          │
└─────────────────────────────────────────────────────────────┘

Layer 1: HTTP-Only Cookie
├─ ✅ JavaScript cannot access token
├─ ✅ XSS attacks cannot steal token
└─ ✅ Token stored securely by browser

Layer 2: Secure Flag
├─ ✅ Cookie only sent over HTTPS
├─ ✅ Man-in-the-middle protection
└─ ✅ Automatic in production

Layer 3: SameSite Attribute
├─ ✅ CSRF attack prevention
├─ ✅ Cookie not sent on cross-site requests
└─ ✅ Strict mode in production

Layer 4: CORS Configuration
├─ ✅ Only allowed origins can make requests
├─ ✅ Credentials required for auth endpoints
└─ ✅ Preflight caching for performance

Layer 5: Token Expiration
├─ ✅ Tokens expire after 7 days
├─ ✅ Password change invalidates tokens
└─ ✅ Logout clears cookie immediately
```

---

## 🆚 Comparison: Before vs After

### Before (localStorage)
```javascript
// ❌ VULNERABLE TO XSS

// Login
const response = await fetch('/api/v1/auth/login', {
  method: 'POST',
  body: JSON.stringify({ email, password }),
});
const { token } = await response.json();
localStorage.setItem('token', token);  // ❌ Accessible to JavaScript

// Subsequent requests
fetch('/api/v1/users/me', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`  // ❌ Manual
  }
});

// Logout
localStorage.removeItem('token');  // ❌ Only client-side
```

### After (HTTP-only cookies)
```javascript
// ✅ SECURE

// Login
await fetch('/api/v1/auth/login', {
  method: 'POST',
  body: JSON.stringify({ email, password }),
  credentials: 'include',  // ✅ Browser handles cookies
});
// Token automatically stored in HTTP-only cookie

// Subsequent requests
fetch('/api/v1/users/me', {
  credentials: 'include',  // ✅ Cookie sent automatically
});

// Logout
await fetch('/api/v1/auth/logout', {
  method: 'POST',
  credentials: 'include',  // ✅ Server clears cookie
});
```

---

## 🎯 Key Differences

| Aspect | localStorage | HTTP-only Cookie |
|--------|--------------|------------------|
| **JavaScript Access** | ✅ Yes | ❌ No |
| **XSS Vulnerability** | ⚠️ High | ✅ Protected |
| **CSRF Vulnerability** | ✅ Protected | ✅ Protected (SameSite) |
| **Automatic Sending** | ❌ Manual | ✅ Automatic |
| **HTTPS Enforcement** | ❌ Optional | ✅ Required (production) |
| **Server-Side Control** | ❌ No | ✅ Yes |
| **Token Exposure** | ⚠️ Visible | ✅ Hidden |

---

## 🧪 Testing the Flow

### 1. Test Login Sets Cookie
```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@ecom.dev","password":"admin1234"}' \
  -c cookies.txt -v

# Look for:
# < Set-Cookie: jwt=...; HttpOnly; SameSite=Strict
```

### 2. Test Cookie Works for Protected Routes
```bash
curl -X GET http://localhost:5000/api/v1/users/me \
  -b cookies.txt -v

# Should return user data
```

### 3. Test Without Cookie Fails
```bash
curl -X GET http://localhost:5000/api/v1/users/me -v

# Should return 401 Unauthorized
```

### 4. Test Logout Clears Cookie
```bash
curl -X POST http://localhost:5000/api/v1/auth/logout \
  -b cookies.txt -c cookies.txt -v

# Cookie should be cleared
```

---

## 📱 Browser DevTools Verification

### Check Cookie in DevTools

1. **Open DevTools** (F12)
2. **Go to Application tab**
3. **Click Cookies** → `http://localhost:5173`
4. **Find `jwt` cookie**

**Verify these attributes:**
```
Name:     jwt
Value:    eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Domain:   localhost
Path:     /
Expires:  [7 days from now]
HttpOnly: ✅ (checkmark)
Secure:   ✅ (if HTTPS)
SameSite: Strict
```

### Check Network Tab

1. **Open DevTools** → **Network tab**
2. **Login**
3. **Click on login request**
4. **Check Response Headers:**
   ```
   Set-Cookie: jwt=...; HttpOnly; Secure; SameSite=Strict
   ```
5. **Check subsequent requests**
6. **Verify Cookie header:**
   ```
   Cookie: jwt=...
   ```

---

## 🚀 Production Deployment

### Environment Variables
```env
NODE_ENV=production
JWT_SECRET=<strong-secret-min-32-chars>
JWT_EXPIRES_IN_DAYS=7
CLIENT_URL=https://yourdomain.com
```

### Verify in Production
1. Login at your frontend
2. Check DevTools → Cookies
3. Verify `Secure` flag is checked
4. Verify `SameSite` is `Strict`
5. Test protected routes work
6. Test logout clears cookie

---

## 💡 Best Practices

1. **Always use HTTPS in production**
   - Secure flag requires HTTPS
   - Prevents man-in-the-middle attacks

2. **Set appropriate expiration**
   - Balance security vs user experience
   - 7 days is a good default

3. **Implement refresh tokens** (optional)
   - Short-lived access tokens
   - Long-lived refresh tokens
   - Better security for sensitive apps

4. **Monitor cookie size**
   - Cookies sent with every request
   - Keep JWT payload minimal

5. **Handle token expiration gracefully**
   - Redirect to login on 401
   - Show clear error messages

---

## 🎓 Summary

✅ **Secure**: HTTP-only cookies prevent XSS attacks  
✅ **Simple**: Browser handles cookie storage automatically  
✅ **Automatic**: Cookies sent with every request  
✅ **Protected**: SameSite prevents CSRF attacks  
✅ **Production-ready**: Proper CORS and security settings  

**Your authentication is now production-grade!** 🚀
