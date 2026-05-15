# Quick Start: Phase 3 Testing

**Purpose:** Get your development environment running for Phase 3 testing  
**Time Required:** 5 minutes  

---

## 🚀 Quick Start (3 Steps)

### Step 1: Start Backend Server

Open a terminal and run:

```bash
cd Backend
npm run dev
```

**Expected Output:**
```
Server running on port 5000
MongoDB connected successfully
```

**Troubleshooting:**
- If port 5000 is busy, check `.env` file for PORT setting
- If MongoDB connection fails, ensure MongoDB is running
- Check `Backend/.env` file exists and has correct DATABASE_URL

---

### Step 2: Start Frontend Server

Open a **NEW** terminal and run:

```bash
cd Frontend
npm run dev
```

**Expected Output:**
```
VITE v5.x.x ready in xxx ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

**Troubleshooting:**
- If port 5173 is busy, Vite will suggest an alternative port
- If dependencies missing, run `npm install` first
- Check `Frontend/.env` file exists and has correct VITE_API_URL

---

### Step 3: Open Admin Panel

1. Open browser: `http://localhost:5173`
2. Navigate to: `http://localhost:5173/login`
3. Login with admin credentials
4. Navigate to: `http://localhost:5173/admin`

**Default Admin Credentials** (check your database):
- Email: `admin@example.com` (or your admin email)
- Password: (your admin password)

---

## ✅ Verification Checklist

Before starting tests, verify:

- [ ] Backend server running (check terminal for "Server running")
- [ ] Frontend server running (check terminal for "Local: http://localhost:5173")
- [ ] Can access `http://localhost:5173` in browser
- [ ] Can login to admin panel
- [ ] Admin dashboard loads without errors
- [ ] Browser console has no errors (F12 → Console tab)

---

## 🧪 Run Tests

Once servers are running:

1. **Open Testing Guide**
   - File: `PHASE_3_TESTING_GUIDE.md`
   - Start with Test 1

2. **Open Browser DevTools**
   - Press F12
   - Go to Console tab
   - Go to Network tab

3. **Execute Tests**
   - Follow each test step-by-step
   - Document results
   - Note any errors

---

## 📋 Quick Test Checklist

### Critical Tests (Must Pass)
- [ ] Create new product with multilingual name/description
- [ ] Edit existing product
- [ ] Update General Settings (company name, tagline)
- [ ] Update Hero Settings (hero content)
- [ ] Update About Settings (about content)
- [ ] Switch language using LanguageSwitcher

### Validation Tests (Must Pass)
- [ ] Required field validation (all 3 languages)
- [ ] Optional field validation
- [ ] Form submission with valid data
- [ ] Form submission with invalid data

### Browser Tests (Should Pass)
- [ ] Chrome/Edge
- [ ] Firefox
- [ ] Safari (if available)

---

## 🐛 Common Issues & Solutions

### Issue: Backend won't start
**Solution:**
```bash
cd Backend
npm install
# Check if MongoDB is running
# Check .env file exists
npm run dev
```

### Issue: Frontend won't start
**Solution:**
```bash
cd Frontend
npm install
# Check .env file exists
npm run dev
```

### Issue: Can't login to admin
**Solution:**
- Check if you have an admin user in database
- Verify credentials
- Check browser console for errors
- Check backend terminal for API errors

### Issue: Amharic text not displaying
**Solution:**
- Check if Noto Sans Ethiopic font loaded (DevTools → Network → Fonts)
- Check Tailwind config has font-sans with Ethiopic font
- Clear browser cache and reload

### Issue: TypeScript errors in editor
**Solution:**
```bash
cd Frontend
npm run type-check
# If errors, check the error messages
# Verify all imports are correct
```

---

## 📊 Test Results

As you complete tests, update `PHASE_3_TEST_RESULTS.md`:

```markdown
### Manual Tests
- [x] Test 1: Product Form - Create New Product ✅
- [x] Test 2: Product Form - Edit Existing Product ✅
- [ ] Test 3: General Settings Form
...
```

---

## 🎯 Success Criteria

**Phase 3 testing is complete when:**

1. ✅ All 15 manual tests executed
2. ✅ All critical tests pass
3. ✅ No blocking bugs found
4. ✅ Test results documented
5. ✅ Stakeholder approval received

---

## 📞 Need Help?

### Check Documentation
1. `PHASE_3_TESTING_GUIDE.md` - Detailed test cases
2. `PHASE_3_COMPLETE.md` - Implementation details
3. `PHASE_3_SUMMARY.md` - Overview
4. `MULTILINGUAL_QUICK_START.md` - Architecture guide

### Check Console Logs
- Backend terminal - API errors
- Frontend terminal - Build errors
- Browser console - Runtime errors
- Browser network tab - API calls

### Common Commands
```bash
# Check if servers running
# Windows: netstat -ano | findstr :5000
# Windows: netstat -ano | findstr :5173

# Restart backend
cd Backend
# Ctrl+C to stop
npm run dev

# Restart frontend
cd Frontend
# Ctrl+C to stop
npm run dev

# Check TypeScript
cd Frontend
npm run type-check

# Check backend syntax
cd Backend
node --check app.js
```

---

## 🎉 Ready to Test!

**Your checklist:**
- [x] Read this guide
- [ ] Start backend server
- [ ] Start frontend server
- [ ] Login to admin panel
- [ ] Open `PHASE_3_TESTING_GUIDE.md`
- [ ] Execute tests
- [ ] Document results

**Good luck with testing! 🚀**

---

**Next Steps After Testing:**
1. Fix any bugs found
2. Update test results document
3. Get stakeholder approval
4. Proceed to Phase 4 (Storefront Display)
