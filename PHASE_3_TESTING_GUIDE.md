# Phase 3 Testing Guide

**Purpose:** Verify all admin panel multilingual forms work correctly  
**Date:** May 15, 2026  
**Tester:** _______________

---

## Prerequisites

- [ ] Backend server running (`npm run dev` in Backend folder)
- [ ] Frontend server running (`npm run dev` in Frontend folder)
- [ ] Admin account credentials ready
- [ ] Browser DevTools open (Console + Network tabs)

---

## Test 1: Product Form - Create New Product

### Steps
1. Navigate to `/admin/products`
2. Click "Add Product" button
3. Fill in multilingual fields:
   - **Product Name (Amharic):** `ላፕቶፕ ኮምፒውተር`
   - **Product Name (English):** `Laptop Computer`
   - **Product Name (Afaan Oromo):** `Kompiitara Laptop`
   - **Description (Amharic):** `ዘመናዊ ላፕቶፕ ኮምፒውተር`
   - **Description (English):** `Modern laptop computer`
   - **Description (Afaan Oromo):** `Kompiitara laptop ammayyaa`
4. Fill in other required fields (price, stock, category, brand)
5. Click "Save Product"

### Expected Results
- [ ] All three language inputs visible and editable
- [ ] Amharic text renders with Ethiopic font
- [ ] Form submits successfully
- [ ] Success toast appears
- [ ] Product appears in product list
- [ ] No console errors

### Validation Test
1. Leave Amharic name empty
2. Try to submit form

### Expected Results
- [ ] Validation error appears: "Amharic translation is required"
- [ ] Form does not submit
- [ ] Error message displays correctly

---

## Test 2: Product Form - Edit Existing Product

### Steps
1. Navigate to `/admin/products`
2. Click "Edit" on any existing product
3. Verify multilingual fields load correctly
4. Modify one language (e.g., English description)
5. Click "Save Product"

### Expected Results
- [ ] Existing data loads in all three language fields
- [ ] Legacy string data converts to multilingual (if applicable)
- [ ] Changes save successfully
- [ ] Other languages remain unchanged
- [ ] No console errors

---

## Test 3: General Settings Form

### Steps
1. Navigate to `/admin/settings`
2. Go to "General" tab
3. Update multilingual fields:
   - **Company Name (Amharic):** `የእኛ ድርጅት`
   - **Company Name (English):** `Our Company`
   - **Company Name (Afaan Oromo):** `Dhaabbata Keenya`
   - **Tagline (Amharic):** `ምርጥ አገልግሎት`
   - **Tagline (English):** `Best Service`
   - **Tagline (Afaan Oromo):** `Tajaajila Gaarii`
4. Click "Save Settings"

### Expected Results
- [ ] All multilingual fields visible
- [ ] Amharic text renders correctly
- [ ] Settings save successfully
- [ ] Success toast appears
- [ ] Page reload shows saved data
- [ ] No console errors

---

## Test 4: Hero Settings Form

### Steps
1. Navigate to `/admin/settings`
2. Go to "Hero" tab
3. Update hero content:
   - **Eyebrow (Amharic):** `አዲስ`
   - **Eyebrow (English):** `New`
   - **Eyebrow (Afaan Oromo):** `Haaraa`
   - **Title (Amharic):** `እንኳን ደህና መጡ`
   - **Title (English):** `Welcome`
   - **Title (Afaan Oromo):** `Baga Nagaan Dhuftan`
4. Add a new slide with multilingual title/subtitle
5. Click "Save Settings"

### Expected Results
- [ ] All hero fields support multilingual input
- [ ] New slide created with multilingual structure
- [ ] Settings save successfully
- [ ] Slide images still work
- [ ] No console errors

---

## Test 5: About Settings Form

### Steps
1. Navigate to `/admin/settings`
2. Go to "About" tab
3. Update about content:
   - **Eyebrow (Amharic):** `ስለ እኛ`
   - **Eyebrow (English):** `About Us`
   - **Eyebrow (Afaan Oromo):** `Waa'ee Keenya`
4. Add a new stat with multilingual label:
   - **Value:** `1000+`
   - **Label (Amharic):** `ደንበኞች`
   - **Label (English):** `Customers`
   - **Label (Afaan Oromo):** `Maamiltootaa`
5. Add a new core value with multilingual title/description
6. Click "Save Settings"

### Expected Results
- [ ] All about fields support multilingual input
- [ ] New stat created with multilingual label
- [ ] New value created with multilingual title/desc
- [ ] Settings save successfully
- [ ] No console errors

---

## Test 6: Language Switcher in Admin Header

### Steps
1. Navigate to any admin page
2. Locate LanguageSwitcher in header (top right area)
3. Click language switcher
4. Select "English"
5. Navigate to different admin pages
6. Refresh browser
7. Check selected language

### Expected Results
- [ ] LanguageSwitcher visible in admin header
- [ ] Dropdown shows all 3 languages
- [ ] Language selection works
- [ ] Language persists across page navigation
- [ ] Language persists after page refresh
- [ ] No console errors

---

## Test 7: Validation - Required Fields

### Steps
1. Navigate to `/admin/products`
2. Click "Add Product"
3. Fill only Amharic name, leave English and Afaan Oromo empty
4. Try to submit

### Expected Results
- [ ] Validation errors appear for English and Afaan Oromo
- [ ] Error messages: "English translation is required"
- [ ] Error messages: "Afaan Oromo translation is required"
- [ ] Form does not submit

---

## Test 8: Validation - Optional Fields

### Steps
1. Navigate to `/admin/products`
2. Click "Add Product"
3. Fill required fields (name, description in all languages)
4. Leave "Short Description" empty in all languages
5. Submit form

### Expected Results
- [ ] Form submits successfully
- [ ] No validation errors for optional fields
- [ ] Product created without short description

---

## Test 9: Legacy Data Handling

### Steps
1. If you have existing products with string (non-multilingual) data:
2. Navigate to `/admin/products`
3. Click "Edit" on a legacy product
4. Check multilingual fields

### Expected Results
- [ ] Legacy string data appears in all three language fields
- [ ] Data converted to multilingual format automatically
- [ ] All fields editable
- [ ] Can save changes successfully

---

## Test 10: Browser Compatibility

### Browsers to Test
- [ ] Chrome/Edge (Chromium)
- [ ] Firefox
- [ ] Safari (if available)

### For Each Browser
1. Navigate to `/admin/products`
2. Create a new product with multilingual data
3. Navigate to `/admin/settings`
4. Update general settings with multilingual data
5. Switch language using LanguageSwitcher

### Expected Results
- [ ] All forms work correctly
- [ ] Amharic text renders correctly
- [ ] No layout issues
- [ ] No console errors

---

## Test 11: Mobile Responsiveness

### Steps
1. Open browser DevTools
2. Switch to mobile viewport (375px width)
3. Navigate to `/admin/products`
4. Click "Add Product"
5. Scroll through multilingual fields
6. Navigate to `/admin/settings`
7. Test all settings forms

### Expected Results
- [ ] Multilingual fields stack vertically
- [ ] All inputs accessible
- [ ] No horizontal scroll
- [ ] Text readable
- [ ] Buttons accessible
- [ ] LanguageSwitcher works on mobile

---

## Test 12: Performance

### Steps
1. Open browser DevTools → Network tab
2. Navigate to `/admin/products`
3. Click "Add Product"
4. Monitor network requests
5. Fill in multilingual fields
6. Monitor console for warnings

### Expected Results
- [ ] No unnecessary API calls
- [ ] No memory leaks
- [ ] No performance warnings
- [ ] Form responds quickly
- [ ] No lag when typing

---

## Test 13: Accessibility

### Steps
1. Navigate to `/admin/products`
2. Click "Add Product"
3. Use Tab key to navigate through form
4. Use screen reader (if available)

### Expected Results
- [ ] All fields accessible via keyboard
- [ ] Tab order logical
- [ ] Labels properly associated
- [ ] ARIA attributes present
- [ ] Screen reader announces fields correctly

---

## Test 14: Error Handling

### Steps
1. Disconnect from internet (or block API in DevTools)
2. Navigate to `/admin/products`
3. Try to create a product
4. Reconnect internet
5. Try again

### Expected Results
- [ ] Error toast appears when offline
- [ ] Form doesn't crash
- [ ] Can retry after reconnecting
- [ ] Data not lost during error

---

## Test 15: Data Persistence

### Steps
1. Navigate to `/admin/products`
2. Click "Add Product"
3. Fill in multilingual fields
4. Navigate away WITHOUT saving
5. Return to product form
6. Check if data persisted (should NOT persist)

### Expected Results
- [ ] Unsaved data is lost (expected behavior)
- [ ] Form resets to empty state
- [ ] No errors

---

## Bug Report Template

If you find any issues, document them using this template:

```
**Bug ID:** [Unique ID]
**Severity:** [Critical / High / Medium / Low]
**Component:** [Product Form / Settings Form / etc.]
**Browser:** [Chrome / Firefox / Safari]
**Steps to Reproduce:**
1. 
2. 
3. 

**Expected Result:**

**Actual Result:**

**Screenshots:** [Attach if applicable]

**Console Errors:** [Copy any errors]

**Additional Notes:**
```

---

## Test Summary

**Date Tested:** _______________  
**Tester Name:** _______________  
**Total Tests:** 15  
**Tests Passed:** _____ / 15  
**Tests Failed:** _____ / 15  
**Bugs Found:** _____  

### Overall Assessment
- [ ] Ready for Phase 4
- [ ] Needs minor fixes
- [ ] Needs major fixes

### Notes:
_______________________________________
_______________________________________
_______________________________________

---

## Sign-off

**Tested By:** _______________  
**Date:** _______________  
**Signature:** _______________  

**Approved By:** _______________  
**Date:** _______________  
**Signature:** _______________  
