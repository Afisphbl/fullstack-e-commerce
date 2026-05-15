# Phase 1 Testing Guide

**Purpose:** Verify Phase 1 implementation before proceeding to Phase 2

---

## 🧪 Backend Testing

### 1. Verify Multilingual Schema Utility

```bash
cd Backend
node -c utils/multilingualSchema.js
```

**Expected:** No errors

**Test the utility:**
```javascript
// Create test file: Backend/test-multilingual.js
const { multilingualString, migrateToMultilingual } = require('./utils/multilingualSchema');

// Test schema creation
const schema = multilingualString(true, 2, 100);
console.log('Schema created:', schema);

// Test migration
const migrated = migrateToMultilingual('Test Product');
console.log('Migrated:', migrated);
// Expected: { am: 'Test Product', en: 'Test Product', om: 'Test Product' }
```

### 2. Verify Models Compile

```bash
cd Backend
node -c models/productModel.js
node -c models/categoryModel.js
node -c models/generalSettingsModel.js
node -c models/heroSettingsModel.js
node -c models/aboutSettingsModel.js
node -c models/contactSettingsModel.js
```

**Expected:** All compile without errors

### 3. Test Database Connection

```bash
cd Backend
node -e "require('./config/env'); require('./config/database')().then(() => { console.log('✅ DB Connected'); process.exit(0); }).catch(err => { console.error('❌ DB Error:', err); process.exit(1); });"
```

**Expected:** ✅ DB Connected

### 4. Run Migration Script (Development Database Only!)

**⚠️ IMPORTANT: Backup database first!**

```bash
# Backup
mongodump --uri="your_mongodb_uri" --out=backup-$(date +%Y%m%d)

# Run migration
cd Backend
node migrations/001-multilingual-migration.js
```

**Expected Output:**
```
🚀 Starting Multilingual Data Migration
=====================================

📦 Migrating Products...
Found X products
✅ Products: X migrated, 0 already multilingual

📁 Migrating Categories...
Found X categories
✅ Categories: X migrated, 0 already multilingual

⚙️  Migrating General Settings...
✅ General Settings: Migrated

🎨 Migrating Hero Settings...
✅ Hero Settings: Migrated

📄 Migrating About Settings...
✅ About Settings: Migrated

📞 Migrating Contact Settings...
✅ Contact Settings: Migrated

=====================================
✅ Migration completed successfully!
=====================================
```

### 5. Verify Migrated Data

**Connect to MongoDB:**
```bash
mongosh "your_mongodb_uri"
```

**Check Product:**
```javascript
db.products.findOne({}, { name: 1, description: 1 })
```

**Expected:**
```javascript
{
  _id: ObjectId("..."),
  name: {
    am: "Product Name",
    en: "Product Name",
    om: "Product Name"
  },
  description: {
    am: "Description...",
    en: "Description...",
    om: "Description..."
  }
}
```

**Check Category:**
```javascript
db.categories.findOne({}, { name: 1, description: 1 })
```

**Check Settings:**
```javascript
db.generalsettings.findOne({}, { companyName: 1, tagline: 1 })
db.herosettings.findOne({}, { heroTitle: 1, heroSubtitle: 1 })
```

### 6. Test Text Search

```javascript
// In MongoDB shell
db.products.find({ $text: { $search: "laptop" } }).limit(5)
```

**Expected:** Returns products with "laptop" in any language field

---

## 🧪 Frontend Testing

### 1. Verify TypeScript Compilation

```bash
cd Frontend
npm run type-check
```

**Expected:** No TypeScript errors

### 2. Verify i18n Configuration

```bash
cd Frontend
npm run dev
```

**Open browser console and test:**
```javascript
// Check i18next is loaded
console.log(window.i18next);

// Check current language
console.log(i18next.language);

// Test translation
console.log(i18next.t('common:save'));
// Expected: "Save" (if English) or "አስቀምጥ" (if Amharic)

// Change language
i18next.changeLanguage('am');
console.log(i18next.t('common:save'));
// Expected: "አስቀምጥ"

i18next.changeLanguage('en');
console.log(i18next.t('common:save'));
// Expected: "Save"

i18next.changeLanguage('om');
console.log(i18next.t('common:save'));
// Expected: "Kuusi"
```

### 3. Test Language Persistence

```javascript
// In browser console
i18next.changeLanguage('am');
localStorage.getItem('i18nextLng');
// Expected: "am"

// Refresh page
// Check language persisted
console.log(i18next.language);
// Expected: "am"
```

### 4. Test Multilingual Components

**Create test page:** `Frontend/src/pages/TestMultilingual.tsx`

```tsx
import { useForm } from 'react-hook-form';
import { MultilingualInput } from '@/components/shared/MultilingualInput';
import { MultilingualTextarea } from '@/components/shared/MultilingualTextarea';
import { LanguageSwitcher } from '@/components/shared/LanguageSwitcher';
import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';

export default function TestMultilingual() {
  const form = useForm({
    defaultValues: {
      name: { am: '', en: '', om: '' },
      description: { am: '', en: '', om: '' }
    }
  });

  const onSubmit = (data: any) => {
    console.log('Form data:', data);
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">Multilingual Components Test</h1>
      
      <div className="mb-4">
        <LanguageSwitcher />
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <MultilingualInput
            name="name"
            label="Product Name"
            control={form.control}
            required
          />

          <MultilingualTextarea
            name="description"
            label="Description"
            control={form.control}
            required
            rows={4}
          />

          <Button type="submit">Submit</Button>
        </form>
      </Form>
    </div>
  );
}
```

**Add route to App.tsx:**
```tsx
<Route path="/test-multilingual" element={<TestMultilingual />} />
```

**Test:**
1. Navigate to `/test-multilingual`
2. Verify all three language inputs render
3. Enter text in each language field
4. Submit form and check console output
5. Test language switcher

### 5. Test Font Rendering

**Test Amharic text:**
```tsx
<p className="font-sans">አማርኛ ፊደላት - Amharic Script Test</p>
<p className="font-sans">ሀ ሁ ሂ ሃ ሄ ህ ሆ</p>
<p className="font-sans">ለ ሉ ሊ ላ ሌ ል ሎ</p>
```

**Verify:**
- Ethiopic characters render correctly
- Font looks clear and readable
- No missing glyphs (□ boxes)

**Test on multiple browsers:**
- Chrome/Edge
- Firefox
- Safari (if available)

### 6. Test useLocalizedField Hook

**Create test component:**
```tsx
import { useLocalizedField } from '@/hooks/useLocalizedField';

const TestComponent = () => {
  const product = {
    name: {
      am: 'ላፕቶፕ',
      en: 'Laptop',
      om: 'Laptop'
    }
  };

  const localizedName = useLocalizedField(product.name);

  return <div>{localizedName}</div>;
};
```

**Test:**
1. Render component
2. Change language with LanguageSwitcher
3. Verify text updates automatically

---

## ✅ Testing Checklist

### Backend
- [ ] Multilingual schema utility compiles
- [ ] All models compile without errors
- [ ] Database connection works
- [ ] Migration script runs successfully
- [ ] Migrated data structure is correct
- [ ] Text search works with multilingual fields
- [ ] No data loss after migration

### Frontend
- [ ] TypeScript compilation passes
- [ ] i18n initializes without errors
- [ ] Translations load correctly
- [ ] Language switching works
- [ ] Language persists in localStorage
- [ ] MultilingualInput renders correctly
- [ ] MultilingualTextarea renders correctly
- [ ] LanguageSwitcher works
- [ ] useLocalizedField hook works
- [ ] Ethiopic font renders correctly
- [ ] No console errors

---

## 🐛 Common Issues & Solutions

### Issue: Migration script fails

**Solution:**
1. Check MongoDB connection string
2. Verify database exists
3. Check user permissions
4. Review error message for specific issue

### Issue: Ethiopic font not rendering

**Solution:**
1. Check browser console for font loading errors
2. Verify Google Fonts URL is accessible
3. Clear browser cache
4. Try different browser

### Issue: i18n not initializing

**Solution:**
1. Check `import './locales'` in main.tsx
2. Verify translation files exist
3. Check browser console for errors
4. Verify i18next packages installed

### Issue: Language not persisting

**Solution:**
1. Check localStorage in browser DevTools
2. Verify `i18nextLng` key exists
3. Check language detector configuration
4. Clear localStorage and test again

---

## 📊 Success Criteria

Phase 1 is ready for Phase 2 when:

✅ All backend models compile  
✅ Migration script runs successfully  
✅ Migrated data structure is correct  
✅ Frontend TypeScript checks pass  
✅ i18n initializes without errors  
✅ All three languages work  
✅ Language switching works  
✅ Language persists across refresh  
✅ Multilingual components render correctly  
✅ Ethiopic font renders correctly  
✅ No console errors  

---

## 🚀 Next Steps

Once all tests pass:

1. **Commit Changes:**
   ```bash
   git add .
   git commit -m "feat: Phase 1 - Multilingual foundation complete"
   ```

2. **Create Backup:**
   - Backup production database
   - Document rollback procedure

3. **Proceed to Phase 2:**
   - Update validation rules
   - Update API endpoints
   - Test with multilingual payloads

---

**Happy Testing! 🎉**
