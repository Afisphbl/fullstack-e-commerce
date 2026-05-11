# CMS Implementation Checklist

## Quick Reference: What Needs to Be Built

### 🎯 Goal
Make existing website content dynamic and manageable from admin panel WITHOUT creating a page builder.

---

## 📊 Summary Statistics

| Category | Count |
|----------|-------|
| **New Database Models** | 7 |
| **New API Endpoints** | ~35 |
| **Pages to Refactor** | 6 |
| **Components to Refactor** | 8 |
| **Admin Interfaces to Build** | 7 |
| **Dynamic Content Pieces** | 60+ |

---

## ✅ PHASE 1: BACKEND DEVELOPMENT

### 1.1 Create Database Models

- [ ] **SiteSettingsModel** (`Backend/models/siteSettingsModel.js`)
  - Site name, logo, favicon
  - Contact info (email, phone, address)
  - Map coordinates
  - Working hours
  - Footer text, copyright
  - Singleton pattern implementation

- [ ] **HeroSlideModel** (`Backend/models/heroSlideModel.js`)
  - Title, subtitle, image
  - Button text, button link
  - Order, isActive
  - Created by (admin reference)

- [ ] **FeatureModel** (`Backend/models/featureModel.js`)
  - Icon name, title, description
  - Order, isActive
  - Created by (admin reference)

- [ ] **PageContentModel** (`Backend/models/pageContentModel.js`)
  - Page identifier (home, about, contact, faq)
  - Sections array (key, title, subtitle, description, image, items)
  - Updated by (admin reference)

- [ ] **FAQModel** (`Backend/models/faqModel.js`)
  - Question, answer, category
  - Order, isActive
  - Created by (admin reference)

- [ ] **SocialLinkModel** (`Backend/models/socialLinkModel.js`)
  - Platform (enum), URL, icon
  - Order, isActive

- [ ] **SEOSettingsModel** (`Backend/models/seoSettingsModel.js`)
  - Page identifier
  - Meta title, description, keywords
  - OG tags, Twitter card
  - Canonical URL

### 1.2 Create Controllers

- [ ] **siteSettingsController.js**
  - `getSettings` - GET public settings
  - `updateSettings` - PATCH update settings (admin)
  - `uploadLogo` - POST upload logo (admin)
  - `uploadFavicon` - POST upload favicon (admin)

- [ ] **heroSlideController.js**
  - `getAllSlides` - GET active slides (public)
  - `getAllSlidesAdmin` - GET all slides (admin)
  - `createSlide` - POST create slide (admin)
  - `updateSlide` - PATCH update slide (admin)
  - `deleteSlide` - DELETE slide (admin)
  - `reorderSlides` - PATCH reorder (admin)

- [ ] **featureController.js**
  - `getAllFeatures` - GET active features (public)
  - `getAllFeaturesAdmin` - GET all features (admin)
  - `createFeature` - POST create (admin)
  - `updateFeature` - PATCH update (admin)
  - `deleteFeature` - DELETE (admin)

- [ ] **pageContentController.js**
  - `getPageContent` - GET content by page (public)
  - `updatePageContent` - PATCH update (admin)
  - `uploadSectionImage` - POST upload image (admin)

- [ ] **faqController.js**
  - `getAllFAQs` - GET active FAQs (public)
  - `getAllFAQsAdmin` - GET all FAQs (admin)
  - `createFAQ` - POST create (admin)
  - `updateFAQ` - PATCH update (admin)
  - `deleteFAQ` - DELETE (admin)

- [ ] **socialLinkController.js**
  - `getAllLinks` - GET active links (public)
  - `createLink` - POST create (admin)
  - `updateLink` - PATCH update (admin)
  - `deleteLink` - DELETE (admin)

- [ ] **seoSettingsController.js**
  - `getSEOSettings` - GET by page (public)
  - `updateSEOSettings` - PATCH update (admin)
  - `uploadOGImage` - POST upload OG image (admin)

### 1.3 Create Routes

- [ ] **siteSettingsRoutes.js** (`Backend/routes/siteSettingsRoutes.js`)
  ```javascript
  GET    /api/v1/settings
  PATCH  /api/v1/settings (admin)
  POST   /api/v1/settings/logo (admin)
  POST   /api/v1/settings/favicon (admin)
  ```

- [ ] **heroSlideRoutes.js** (`Backend/routes/heroSlideRoutes.js`)
  ```javascript
  GET    /api/v1/hero-slides
  GET    /api/v1/hero-slides/admin (admin)
  POST   /api/v1/hero-slides (admin)
  PATCH  /api/v1/hero-slides/:id (admin)
  DELETE /api/v1/hero-slides/:id (admin)
  PATCH  /api/v1/hero-slides/:id/reorder (admin)
  ```

- [ ] **featureRoutes.js** (`Backend/routes/featureRoutes.js`)
- [ ] **pageContentRoutes.js** (`Backend/routes/pageContentRoutes.js`)
- [ ] **faqRoutes.js** (`Backend/routes/faqRoutes.js`)
- [ ] **socialLinkRoutes.js** (`Backend/routes/socialLinkRoutes.js`)
- [ ] **seoSettingsRoutes.js** (`Backend/routes/seoSettingsRoutes.js`)

### 1.4 Register Routes in app.js

- [ ] Add all 7 new route imports
- [ ] Register routes with `/api/v1` prefix

### 1.5 Create Seed Script

- [ ] **seedCMSData.js** (`Backend/utils/seedCMSData.js`)
  - Extract all hardcoded content from frontend
  - Insert into database
  - Run once during deployment

### 1.6 Testing

- [ ] Test all endpoints with Postman/Thunder Client
- [ ] Test authentication/authorization
- [ ] Test image uploads
- [ ] Test validation errors
- [ ] Test edge cases (empty data, missing fields)

---

## ✅ PHASE 2: FRONTEND API INTEGRATION

### 2.1 Create API Functions

- [x] **Update `Frontend/src/lib/api.ts`**
  - [x] `fetchSiteSettings()`
  - [x] `updateSiteSettings(data)`
  - [x] `uploadLogo(file)`
  - [x] `fetchHeroSlides()`
  - [x] `createHeroSlide(data)`
  - [x] `updateHeroSlide(id, data)`
  - [x] `deleteHeroSlide(id)`
  - [x] `fetchFeatures()`
  - [x] `createFeature(data)`
  - [x] `updateFeature(id, data)`
  - [x] `deleteFeature(id)`
  - [x] `fetchPageContent(page)`
  - [x] `updatePageContent(page, data)`
  - [x] `fetchFAQs()` (update existing)
  - [x] `createFAQ(data)`
  - [x] `updateFAQ(id, data)`
  - [x] `deleteFAQ(id)`
  - [x] `fetchSocialLinks()`
  - [x] `createSocialLink(data)`
  - [x] `updateSocialLink(id, data)`
  - [x] `deleteSocialLink(id)`
  - [x] `fetchSEOSettings(page)`
  - [x] `updateSEOSettings(page, data)`

### 2.2 Create React Query Hooks

- [x] **`Frontend/src/hooks/useSiteSettings.ts`**
  ```typescript
  export const useSiteSettings = () => { ... }
  export const useUpdateSiteSettings = () => { ... }
  ```

- [x] **`Frontend/src/hooks/useHeroSlides.ts`**
  ```typescript
  export const useHeroSlides = () => { ... }
  export const useCreateHeroSlide = () => { ... }
  export const useUpdateHeroSlide = () => { ... }
  export const useDeleteHeroSlide = () => { ... }
  ```

- [x] **`Frontend/src/hooks/useFeatures.ts`**
- [x] **`Frontend/src/hooks/usePageContent.ts`**
- [x] **`Frontend/src/hooks/useFAQs.ts`** (update existing)
- [x] **`Frontend/src/hooks/useSocialLinks.ts`**
- [x] **`Frontend/src/hooks/useSEOSettings.ts`**

### 2.3 Refactor Pages

- [x] **Homepage** (`Frontend/src/pages/Index.tsx`)
  - [x] Replace hardcoded hero slides with `useHeroSlides()`
  - [x] Replace hardcoded features with `useFeatures()`
  - [x] Replace hardcoded section titles with `usePageContent('home')`
  - [x] Replace hardcoded CTA with dynamic content
  - [x] Add loading skeletons
  - [x] Add error handling
  - [x] Add fallbacks to defaults

- [x] **About Page** (`Frontend/src/pages/AboutPage.tsx`)
  - [x] Replace all hardcoded content with `usePageContent('about')`
  - [x] Hero section
  - [x] Statistics section
  - [x] Core values section
  - [x] Strategic pillars section
  - [x] Add loading states

- [x] **Contact Page** (`Frontend/src/pages/ContactPage.tsx`)
  - [x] Replace contact info with `useSiteSettings()`
  - [x] Replace working hours with dynamic data
  - [x] Replace social links with `useSocialLinks()`
  - [x] Replace map with dynamic coordinates
  - [x] Add loading states

- [x] **FAQ Page** (`Frontend/src/pages/FAQPage.tsx`)
  - [x] Replace JSON import with `useFAQs()` hook
  - [x] Add loading states
  - [x] Keep existing search/filter functionality

- [x] **Header** (`Frontend/src/components/layout/Header.tsx`)
  - [x] Replace hardcoded logo with `useSiteSettings()`
  - [x] Keep navigation links (or make dynamic if needed)

- [x] **Footer** (`Frontend/src/components/layout/Footer.tsx`)
  - [x] Replace hardcoded brand name with `useSiteSettings()`
  - [x] Replace contact info with dynamic data
  - [x] Replace copyright with dynamic text
  - [x] Replace social links with `useSocialLinks()`

### 2.4 Create Loading Components

- [x] **HeroSkeleton.tsx** - Skeleton for hero section
- [x] **FeaturesSkeleton.tsx** - Skeleton for features
- [x] **ContentSkeleton.tsx** - Generic content skeleton

### 2.5 SEO Integration

- [ ] **Create SEO Component** (`Frontend/src/components/SEO.tsx`)
  ```typescript
  const SEO = ({ page }) => {
    const { data: seo } = useSEOSettings(page);
    return (
      <Helmet>
        <title>{seo?.metaTitle}</title>
        <meta name="description" content={seo?.metaDescription} />
        {/* ... more meta tags */}
      </Helmet>
    );
  };
  ```

- [ ] Add SEO component to all pages

---

## ✅ PHASE 3: ADMIN INTERFACE

### 3.1 Create Admin Content Management Page

- [x] **New Route**: `/admin/content`
- [x] **New Page**: `Frontend/src/pages/admin/AdminContentPage.tsx`
- [x] **Tab Navigation**:
  - Site Settings
  - Homepage Content
  - About Page
  - Contact Info
  - FAQs
  - Social Links
  - SEO Settings

### 3.2 Build Admin Components

#### Site Settings Tab
- [x] **`AdminSiteSettings.tsx`**
  - Form for site name, tagline
  - Logo upload with preview
  - Favicon upload
  - Contact info form (email, phone, address)
  - Working hours editor (7 days)
  - Map location (lat/lng or embed URL)
  - Footer text, copyright text
  - Save button with loading state

#### Hero Slides Manager
- [x] **`AdminHeroSlides.tsx`**
  - List of slides with thumbnails
  - Drag-to-reorder functionality (react-beautiful-dnd)
  - Add slide button
  - Edit/Delete buttons per slide
  - Active/Inactive toggle

- [x] **`HeroSlideDialog.tsx`**
  - Modal for add/edit
  - Image upload with preview
  - Title input
  - Subtitle input
  - Button text input
  - Button link input
  - Order input
  - Active checkbox
  - Save/Cancel buttons

#### Features Manager
- [x] **`AdminFeatures.tsx`**
  - List of features
  - Add feature button
  - Edit/Delete buttons
  - Reorder functionality

- [x] **`FeatureDialog.tsx`**
  - Icon picker (dropdown with Lucide icons)
  - Title input
  - Description textarea
  - Order input
  - Active checkbox

#### Page Content Editor
- [x] **`AdminPageContent.tsx`**
  - Page selector (Home, About, Contact, FAQ)
  - Section-based editor
  - Dynamic form based on page structure

- [x] **`PageContentSection.tsx`** (Integrated into AdminPageContent)
  - Title input
  - Subtitle input
  - Description textarea (or rich text editor)
  - Image upload
  - Button text/link inputs
  - Items list (for stats, values, pillars)

#### FAQ Manager
- [x] **`AdminFAQs.tsx`**
  - Category filter tabs
  - List of FAQs per category
  - Add FAQ button
  - Edit/Delete buttons
  - Drag-to-reorder within category

- [x] **`FAQDialog.tsx`**
  - Question input
  - Answer textarea
  - Category dropdown
  - Order input
  - Active checkbox

#### Social Links Manager
- [x] **`AdminSocialLinks.tsx`**
  - List of social links
  - Platform icons
  - Add link button
  - Edit/Delete buttons

- [x] **`SocialLinkDialog.tsx`**
  - Platform dropdown (Facebook, Instagram, etc.)
  - URL input
  - Active checkbox

#### SEO Settings Editor
- [x] **`AdminSEOSettings.tsx`**
  - Page selector
  - Meta title input
  - Meta description textarea
  - Keywords input (tags)
  - OG title input
  - OG description textarea
  - OG image upload
  - Twitter card type dropdown
  - Canonical URL input
  - Preview section

### 3.3 Shared Admin Components

- [x] **`ImageUpload.tsx`** - Reusable image upload component
- [x] **`IconPicker.tsx`** - Icon selection dropdown
- [ ] **`RichTextEditor.tsx`** - Rich text editor (optional - not needed)
- [ ] **`DragDropList.tsx`** - Reusable drag-drop list (optional - not needed)

### 3.4 Update Admin Navigation

- [x] Add "Content" link to admin sidebar
- [x] Add icon for content management

---

## ✅ PHASE 4: TESTING & POLISH

### 4.1 Functional Testing

- [ ] Test all CRUD operations for each model
- [ ] Test image uploads (logo, favicon, hero images, OG images)
- [ ] Test reordering functionality
- [ ] Test active/inactive toggles
- [ ] Test form validations
- [ ] Test error handling
- [ ] Test loading states
- [ ] Test fallback to defaults

### 4.2 User Experience Testing

- [ ] Test admin interface on desktop
- [ ] Test admin interface on tablet
- [ ] Test admin interface on mobile
- [ ] Test public pages on all devices
- [ ] Test with slow network (loading states)
- [ ] Test with failed API calls (error states)

### 4.3 Performance Testing

- [ ] Check React Query caching
- [ ] Check image optimization (Cloudinary)
- [ ] Check API response times
- [ ] Check database query performance
- [ ] Add indexes to frequently queried fields

### 4.4 Security Testing

- [ ] Verify admin-only routes are protected
- [ ] Test unauthorized access attempts
- [ ] Test input sanitization (XSS prevention)
- [ ] Test file upload security (size, type validation)
- [ ] Test rate limiting

### 4.5 SEO Testing

- [ ] Verify meta tags are rendered correctly
- [ ] Test OG tags with Facebook debugger
- [ ] Test Twitter cards with Twitter validator
- [ ] Check structured data (if implemented)
- [ ] Test canonical URLs

---

## 📝 DOCUMENTATION

### For Developers

- [ ] **API Documentation**
  - Document all endpoints
  - Request/response examples
  - Authentication requirements

- [ ] **Database Schema Documentation**
  - ER diagram
  - Field descriptions
  - Relationships

- [ ] **Frontend Architecture Documentation**
  - Component hierarchy
  - State management
  - API integration patterns

### For Admins

- [ ] **Admin User Guide**
  - How to update site settings
  - How to manage hero slides
  - How to manage features
  - How to edit page content
  - How to manage FAQs
  - How to manage social links
  - How to update SEO settings

- [ ] **Video Tutorials** (optional)
  - Screen recordings of common tasks

---

## 🚀 DEPLOYMENT

### Pre-Deployment

- [ ] Run seed script to populate initial data
- [ ] Test on staging environment
- [ ] Backup existing database
- [ ] Prepare rollback plan

### Deployment Steps

- [ ] Deploy backend with new models/routes
- [ ] Run database migrations
- [ ] Seed CMS data
- [ ] Deploy frontend with refactored components
- [ ] Test all pages in production
- [ ] Monitor error logs

### Post-Deployment

- [ ] Train admin users
- [ ] Monitor performance
- [ ] Collect feedback
- [ ] Fix any issues
- [ ] Document lessons learned

---

## 📊 PROGRESS TRACKING

### Backend Progress: 0/7 Models, 0/35 Endpoints
- [ ] Models: 0/7
- [ ] Controllers: 0/7
- [ ] Routes: 0/7
- [ ] Seed Script: 0/1
- [ ] Testing: 0/1

### Frontend Progress: 6/6 Pages, 2/2 Components
- [x] API Functions: 20/20
- [x] React Query Hooks: 7/7
- [x] Pages Refactored: 6/6
- [x] Components Refactored: 2/2
- [x] Loading Components: 3/3
- [ ] SEO Integration: 0/1

### Admin Interface Progress: 7/7 Interfaces ✅
- [x] Site Settings: 1/1
- [x] Hero Slides: 2/2
- [x] Features: 2/2
- [x] Page Content: 1/1
- [x] FAQs: 2/2
- [x] Social Links: 2/2
- [x] SEO Settings: 1/1

### Testing Progress: 0/5 Categories
- [ ] Functional: 0/1
- [ ] UX: 0/1
- [ ] Performance: 0/1
- [ ] Security: 0/1
- [ ] SEO: 0/1

---

## 🎯 PRIORITY ORDER

### High Priority (Week 1)
1. Site Settings Model + API
2. Hero Slides Model + API
3. Features Model + API
4. FAQ Model + API
5. Refactor Homepage
6. Refactor Header/Footer

### Medium Priority (Week 2)
1. Page Content Model + API
2. Social Links Model + API
3. Refactor About Page
4. Refactor Contact Page
5. Admin Site Settings Interface
6. Admin Hero Slides Interface

### Low Priority (Week 3)
1. SEO Settings Model + API
2. Admin FAQ Interface
3. Admin Social Links Interface
4. Admin SEO Interface
5. Testing & Polish

---

## 💡 TIPS FOR IMPLEMENTATION

1. **Start Small**: Begin with Site Settings (simplest model)
2. **Test Early**: Test each endpoint before moving to next
3. **Reuse Code**: Create reusable components for admin interface
4. **Keep Fallbacks**: Always have default values if API fails
5. **Cache Wisely**: Use React Query caching to reduce API calls
6. **Document As You Go**: Don't wait until the end
7. **Get Feedback**: Show admin interface to users early

---

## 🔗 RELATED FILES

- Main Analysis: `CMS_ANALYSIS_AND_ARCHITECTURE.md`
- Backend Models: `Backend/models/`
- Backend Controllers: `Backend/controllers/`
- Backend Routes: `Backend/routes/`
- Frontend API: `Frontend/src/lib/api.ts`
- Frontend Hooks: `Frontend/src/hooks/`
- Frontend Pages: `Frontend/src/pages/`
- Admin Pages: `Frontend/src/pages/admin/`

---

**Last Updated**: [Current Date]
**Status**: Planning Phase
**Next Action**: Review and approve architecture, then begin Phase 1
