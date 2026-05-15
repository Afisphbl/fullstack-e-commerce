# Multilingual Implementation - Quick Start Guide

## 📋 Overview

This guide provides a quick reference for implementing the multilingual system. For complete details, see `MULTILINGUAL_ANALYSIS_REPORT.md`.

## 🎯 Target Languages

- **Amharic (am)** - Default language
- **English (en)**
- **Afaan Oromo (om)**

## ⚡ Quick Implementation Steps

### Step 1: Install Dependencies

```bash
# Frontend
cd Frontend
npm install i18next react-i18next i18next-browser-languagedetector

# Backend - no new dependencies needed
```

### Step 2: Backend Schema Updates

**Create multilingual schema helper:**

```javascript
// Backend/utils/multilingualSchema.js
const multilingualString = (required = false) => ({
  type: {
    am: { type: String, required },
    en: { type: String, required },
    om: { type: String, required }
  },
  required
});

module.exports = { multilingualString };
```

**Update Product Model:**

```javascript
const { multilingualString } = require('../utils/multilingualSchema');

const productSchema = new mongoose.Schema({
  name: multilingualString(true),
  description: multilingualString(true),
  shortDescription: multilingualString(false),
  // ... other fields
});
```

### Step 3: Frontend i18n Setup

**Create i18n configuration:**

```typescript
// Frontend/src/locales/index.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import commonAm from './am/common.json';
import commonEn from './en/common.json';
import commonOm from './om/common.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      am: { common: commonAm },
      en: { common: commonEn },
      om: { common: commonOm }
    },
    fallbackLng: 'am',
    defaultNS: 'common',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
```

**Import in main.tsx:**

```typescript
import './locales';
```

### Step 4: Create Reusable Components

**MultilingualInput Component:**

```tsx
// Frontend/src/components/shared/MultilingualInput.tsx
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Control } from 'react-hook-form';

interface MultilingualInputProps {
  name: string;
  label: string;
  control: Control<any>;
  required?: boolean;
  type?: 'text' | 'textarea';
}

export const MultilingualInput = ({
  name, label, control, required, type = 'text'
}: MultilingualInputProps) => {
  const Component = type === 'textarea' ? Textarea : Input;
  
  return (
    <div className="space-y-3">
      <label className="text-sm font-medium">
        {label} {required && <span className="text-destructive">*</span>}
      </label>
      
      <div className="space-y-2 border rounded-lg p-3 bg-muted/30">
        <FormField
          control={control}
          name={`${name}.am`}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs text-muted-foreground">
                አማርኛ (Amharic)
              </FormLabel>
              <FormControl>
                <Component {...field} placeholder="Enter Amharic text" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={control}
          name={`${name}.en`}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs text-muted-foreground">
                English
              </FormLabel>
              <FormControl>
                <Component {...field} placeholder="Enter English text" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={control}
          name={`${name}.om`}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs text-muted-foreground">
                Afaan Oromo
              </FormLabel>
              <FormControl>
                <Component {...field} placeholder="Enter Afaan Oromo text" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};
```

### Step 5: Language Switcher

```tsx
// Frontend/src/components/shared/LanguageSwitcher.tsx
import { useTranslation } from 'react-i18next';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Globe } from 'lucide-react';

export const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  
  return (
    <Select value={i18n.language} onValueChange={i18n.changeLanguage}>
      <SelectTrigger className="w-[140px]">
        <Globe className="h-4 w-4 mr-2" />
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="am">አማርኛ</SelectItem>
        <SelectItem value="en">English</SelectItem>
        <SelectItem value="om">Afaan Oromo</SelectItem>
      </SelectContent>
    </Select>
  );
};
```

### Step 6: Use Translations

**In Components:**

```tsx
import { useTranslation } from 'react-i18next';

const MyComponent = () => {
  const { t } = useTranslation('common');
  
  return (
    <button>{t('save')}</button>
  );
};
```

**For Dynamic Content:**

```tsx
import { useTranslation } from 'react-i18next';

const ProductCard = ({ product }) => {
  const { i18n } = useTranslation();
  const lang = i18n.language as 'am' | 'en' | 'om';
  
  return (
    <div>
      <h3>{product.name[lang] || product.name.en}</h3>
      <p>{product.description[lang] || product.description.en}</p>
    </div>
  );
};
```

## 📁 Required Translation Files

Create these files with appropriate translations:

```
Frontend/src/locales/
├── am/
│   ├── common.json
│   ├── navigation.json
│   ├── product.json
│   └── cart.json
├── en/
│   └── [same files]
└── om/
    └── [same files]
```

## 🔄 Data Migration

**Migration Script:**

```javascript
// Backend/migrations/001-multilingual.js
const mongoose = require('mongoose');
const Product = require('../models/productModel');

const migrate = async () => {
  const products = await Product.find({});
  
  for (const product of products) {
    if (typeof product.name === 'string') {
      product.name = {
        am: product.name,
        en: product.name,
        om: product.name
      };
      product.description = {
        am: product.description,
        en: product.description,
        om: product.description
      };
      await product.save({ validateBeforeSave: false });
    }
  }
  
  console.log(`Migrated ${products.length} products`);
};

migrate().then(() => process.exit(0));
```

## ✅ Testing Checklist

- [ ] Backend accepts multilingual payloads
- [ ] Backend returns multilingual data
- [ ] Frontend displays correct language
- [ ] Language switcher works
- [ ] Language persists across refresh
- [ ] Admin forms accept all languages
- [ ] Validation works for all languages
- [ ] No layout breaking
- [ ] Fonts render correctly

## 📚 Resources

- Full Analysis: `MULTILINGUAL_ANALYSIS_REPORT.md`
- i18next Docs: https://www.i18next.com/
- React i18next: https://react.i18next.com/

## 🚀 Next Steps

1. Review full analysis report
2. Begin Phase 1 implementation
3. Test thoroughly at each phase
4. Deploy incrementally

---

**Need Help?** Refer to the complete analysis report for detailed implementation guidance.
