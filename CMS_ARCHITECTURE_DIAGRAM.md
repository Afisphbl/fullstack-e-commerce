# CMS Architecture Visual Diagram

## System Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         USER INTERFACE                               │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌──────────────────────┐         ┌──────────────────────┐         │
│  │   PUBLIC WEBSITE     │         │   ADMIN DASHBOARD    │         │
│  │                      │         │                      │         │
│  │  • Homepage          │         │  • Site Settings     │         │
│  │  • About Page        │         │  • Hero Slides Mgr   │         │
│  │  • Contact Page      │         │  • Features Mgr      │         │
│  │  • FAQ Page          │         │  • Page Content Ed   │         │
│  │  • Header/Footer     │         │  • FAQ Manager       │         │
│  │                      │         │  • Social Links Mgr  │         │
│  │  (Dynamic Content)   │         │  • SEO Settings      │         │
│  └──────────────────────┘         └──────────────────────┘         │
│           │                                    │                     │
│           │                                    │                     │
│           ▼                                    ▼                     │
└───────────────────────────────────────────────────────────────────┘
            │                                    │
            │         ┌──────────────────────────┘
            │         │
            ▼         ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         FRONTEND LAYER                               │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                    React Query Hooks                          │  │
│  │                                                                │  │
│  │  useSiteSettings()  useHeroSlides()  useFeatures()           │  │
│  │  usePageContent()   useFAQs()        useSocialLinks()        │  │
│  │  useSEOSettings()                                             │  │
│  │                                                                │  │
│  │  [Caching • Loading States • Error Handling • Optimistic UI] │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                │                                     │
│                                ▼                                     │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                      API Client Layer                         │  │
│  │                                                                │  │
│  │  fetchSiteSettings()    updateSiteSettings()                 │  │
│  │  fetchHeroSlides()      createHeroSlide()                    │  │
│  │  fetchFeatures()        updateFeature()                      │  │
│  │  fetchPageContent()     updatePageContent()                  │  │
│  │  fetchFAQs()            createFAQ()                          │  │
│  │  fetchSocialLinks()     updateSocialLink()                   │  │
│  │  fetchSEOSettings()     updateSEOSettings()                  │  │
│  │                                                                │  │
│  │  [Authentication • Request/Response Formatting • Error Maps] │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                       │
└───────────────────────────────────────────────────────────────────┘
                                 │
                                 │ HTTP/HTTPS
                                 │ REST API
                                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         BACKEND LAYER                                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                      Express Routes                           │  │
│  │                                                                │  │
│  │  /api/v1/settings          /api/v1/hero-slides               │  │
│  │  /api/v1/features          /api/v1/content/:page             │  │
│  │  /api/v1/faqs              /api/v1/social-links              │  │
│  │  /api/v1/seo/:page                                           │  │
│  │                                                                │  │
│  │  [Auth Middleware • Validation • Rate Limiting • CORS]       │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                │                                     │
│                                ▼                                     │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                       Controllers                             │  │
│  │                                                                │  │
│  │  siteSettingsController    heroSlideController               │  │
│  │  featureController         pageContentController             │  │
│  │  faqController             socialLinkController              │  │
│  │  seoSettingsController                                       │  │
│  │                                                                │  │
│  │  [Business Logic • Validation • Error Handling]              │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                │                                     │
│                                ▼                                     │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                      Mongoose Models                          │  │
│  │                                                                │  │
│  │  SiteSettings    HeroSlide      Feature                      │  │
│  │  PageContent     FAQ            SocialLink                   │  │
│  │  SEOSettings                                                  │  │
│  │                                                                │  │
│  │  [Schema Validation • Hooks • Virtual Fields • Methods]      │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                       │
└───────────────────────────────────────────────────────────────────┘
                                 │
                                 │ MongoDB Driver
                                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         DATABASE LAYER                               │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│                          MongoDB Database                            │
│                                                                       │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐        │
│  │ site_settings  │  │  hero_slides   │  │   features     │        │
│  └────────────────┘  └────────────────┘  └────────────────┘        │
│                                                                       │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐        │
│  │ page_contents  │  │     faqs       │  │ social_links   │        │
│  └────────────────┘  └────────────────┘  └────────────────┘        │
│                                                                       │
│  ┌────────────────┐                                                  │
│  │ seo_settings   │                                                  │
│  └────────────────┘                                                  │
│                                                                       │
│  [Indexes • Replication • Backup • Sharding]                        │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
                                 │
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      EXTERNAL SERVICES                               │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌──────────────────┐         ┌──────────────────┐                 │
│  │   Cloudinary     │         │   Email Service  │                 │
│  │                  │         │                  │                 │
│  │  • Image Upload  │         │  • Notifications │                 │
│  │  • Optimization  │         │  • Alerts        │                 │
│  │  • CDN Delivery  │         │                  │                 │
│  └──────────────────┘         └──────────────────┘                 │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Data Flow Diagrams

### 1. Public User Views Homepage

```
┌──────────┐
│  User    │
│ Browser  │
└────┬─────┘
     │
     │ 1. Navigate to /
     ▼
┌─────────────────┐
│  Homepage       │
│  Component      │
└────┬────────────┘
     │
     │ 2. useHeroSlides()
     │    useFeatures()
     │    usePageContent('home')
     ▼
┌─────────────────┐
│  React Query    │
│  (Check Cache)  │
└────┬────────────┘
     │
     │ 3. Cache Miss → API Call
     ▼
┌─────────────────┐
│  API Client     │
│  apiFetch()     │
└────┬────────────┘
     │
     │ 4. GET /api/v1/hero-slides
     │    GET /api/v1/features
     │    GET /api/v1/content/home
     ▼
┌─────────────────┐
│  Express        │
│  Routes         │
└────┬────────────┘
     │
     │ 5. Route to Controller
     ▼
┌─────────────────┐
│  Controller     │
│  getAllSlides() │
└────┬────────────┘
     │
     │ 6. Query Database
     ▼
┌─────────────────┐
│  Mongoose       │
│  Model.find()   │
└────┬────────────┘
     │
     │ 7. MongoDB Query
     ▼
┌─────────────────┐
│  MongoDB        │
│  Database       │
└────┬────────────┘
     │
     │ 8. Return Documents
     ▼
┌─────────────────┐
│  Controller     │
│  Format Response│
└────┬────────────┘
     │
     │ 9. JSON Response
     ▼
┌─────────────────┐
│  React Query    │
│  Cache & Update │
└────┬────────────┘
     │
     │ 10. Render UI
     ▼
┌─────────────────┐
│  Homepage       │
│  (Dynamic Data) │
└─────────────────┘
```

---

### 2. Admin Updates Hero Slide

```
┌──────────┐
│  Admin   │
│  User    │
└────┬─────┘
     │
     │ 1. Edit Slide Form
     ▼
┌─────────────────┐
│  HeroSlide      │
│  Dialog         │
└────┬────────────┘
     │
     │ 2. Submit Form
     │    useUpdateHeroSlide()
     ▼
┌─────────────────┐
│  React Query    │
│  Mutation       │
└────┬────────────┘
     │
     │ 3. PATCH /api/v1/hero-slides/:id
     │    Authorization: Bearer <token>
     ▼
┌─────────────────┐
│  Express        │
│  Route          │
└────┬────────────┘
     │
     │ 4. Auth Middleware
     │    Check if Admin
     ▼
┌─────────────────┐
│  Auth           │
│  Middleware     │
└────┬────────────┘
     │
     │ 5. Authorized ✓
     ▼
┌─────────────────┐
│  Validation     │
│  Middleware     │
└────┬────────────┘
     │
     │ 6. Valid Data ✓
     ▼
┌─────────────────┐
│  Controller     │
│  updateSlide()  │
└────┬────────────┘
     │
     │ 7. Update Database
     ▼
┌─────────────────┐
│  Mongoose       │
│  Model.update() │
└────┬────────────┘
     │
     │ 8. MongoDB Update
     ▼
┌─────────────────┐
│  MongoDB        │
│  Database       │
└────┬────────────┘
     │
     │ 9. Return Updated Doc
     ▼
┌─────────────────┐
│  Controller     │
│  Format Response│
└────┬────────────┘
     │
     │ 10. JSON Response
     ▼
┌─────────────────┐
│  React Query    │
│  Invalidate     │
│  Cache          │
└────┬────────────┘
     │
     │ 11. Refetch Data
     │     Update UI
     ▼
┌─────────────────┐
│  Admin UI       │
│  Success Toast  │
└─────────────────┘
```

---

## Database Schema Relationships

```
┌─────────────────────────────────────────────────────────────────┐
│                      DATABASE COLLECTIONS                        │
└─────────────────────────────────────────────────────────────────┘

┌──────────────────┐
│  site_settings   │  (Singleton - Only 1 document)
├──────────────────┤
│ _id              │
│ siteName         │
│ siteTagline      │
│ siteLogo         │
│ contactEmail     │
│ contactPhone     │
│ contactAddress   │
│ workingHours {}  │
│ footerText       │
│ copyrightText    │
│ updatedBy ───────┼──┐
│ createdAt        │  │
│ updatedAt        │  │
└──────────────────┘  │
                      │
┌──────────────────┐  │
│   hero_slides    │  │
├──────────────────┤  │
│ _id              │  │
│ title            │  │
│ subtitle         │  │
│ image            │  │
│ buttonText       │  │
│ buttonLink       │  │
│ order            │  │
│ isActive         │  │
│ createdBy ───────┼──┤
│ createdAt        │  │
│ updatedAt        │  │
└──────────────────┘  │
                      │
┌──────────────────┐  │
│    features      │  │
├──────────────────┤  │
│ _id              │  │
│ icon             │  │
│ title            │  │
│ description      │  │
│ order            │  │
│ isActive         │  │
│ createdBy ───────┼──┤
│ createdAt        │  │
│ updatedAt        │  │
└──────────────────┘  │
                      │
┌──────────────────┐  │
│  page_contents   │  │
├──────────────────┤  │
│ _id              │  │
│ page (enum)      │  │
│ sections []      │  │
│   - key          │  │
│   - title        │  │
│   - subtitle     │  │
│   - description  │  │
│   - image        │  │
│   - items []     │  │
│ updatedBy ───────┼──┤
│ createdAt        │  │
│ updatedAt        │  │
└──────────────────┘  │
                      │
┌──────────────────┐  │
│      faqs        │  │
├──────────────────┤  │
│ _id              │  │
│ question         │  │
│ answer           │  │
│ category (enum)  │  │
│ order            │  │
│ isActive         │  │
│ createdBy ───────┼──┤
│ createdAt        │  │
│ updatedAt        │  │
└──────────────────┘  │
                      │
┌──────────────────┐  │
│  social_links    │  │
├──────────────────┤  │
│ _id              │  │
│ platform (enum)  │  │
│ url              │  │
│ icon             │  │
│ order            │  │
│ isActive         │  │
│ createdAt        │  │
│ updatedAt        │  │
└──────────────────┘  │
                      │
┌──────────────────┐  │
│  seo_settings    │  │
├──────────────────┤  │
│ _id              │  │
│ page (enum)      │  │
│ metaTitle        │  │
│ metaDescription  │  │
│ metaKeywords []  │  │
│ ogTitle          │  │
│ ogDescription    │  │
│ ogImage          │  │
│ twitterCard      │  │
│ canonicalUrl     │  │
│ updatedBy ───────┼──┤
│ createdAt        │  │
│ updatedAt        │  │
└──────────────────┘  │
                      │
                      │
┌──────────────────┐  │
│      users       │◄─┘ (Existing Collection)
├──────────────────┤
│ _id              │
│ name             │
│ email            │
│ role             │
│ ...              │
└──────────────────┘
```

---

## Component Hierarchy

### Public Website

```
App
├── Header (Dynamic: Logo, Nav Links)
│   ├── useSiteSettings()
│   └── Navigation
│
├── Routes
│   ├── Homepage
│   │   ├── HeroSection
│   │   │   └── useHeroSlides()
│   │   ├── FeaturesSection
│   │   │   └── useFeatures()
│   │   ├── CategoriesSection
│   │   ├── FeaturedProductsSection
│   │   ├── NewArrivalsSection
│   │   └── CTASection
│   │       └── usePageContent('home')
│   │
│   ├── AboutPage
│   │   ├── HeroSection
│   │   ├── StatsSection
│   │   ├── ValuesSection
│   │   └── PillarsSection
│   │       └── usePageContent('about')
│   │
│   ├── ContactPage
│   │   ├── ContactForm
│   │   ├── ContactInfo
│   │   │   └── useSiteSettings()
│   │   ├── WorkingHours
│   │   │   └── useSiteSettings()
│   │   ├── SocialLinks
│   │   │   └── useSocialLinks()
│   │   └── Map
│   │       └── useSiteSettings()
│   │
│   └── FAQPage
│       ├── SearchBar
│       └── FAQList
│           └── useFAQs()
│
└── Footer (Dynamic: Brand, Contact, Links)
    ├── useSiteSettings()
    └── useSocialLinks()
```

### Admin Dashboard

```
AdminLayout
├── Sidebar
│   └── Content Management Link
│
└── Routes
    └── AdminContentPage
        ├── TabNavigation
        │
        ├── SiteSettingsTab
        │   └── AdminSiteSettings
        │       ├── BrandingForm
        │       ├── ContactInfoForm
        │       ├── WorkingHoursEditor
        │       └── FooterForm
        │
        ├── HomepageTab
        │   ├── AdminHeroSlides
        │   │   ├── SlidesList (Drag-Drop)
        │   │   └── HeroSlideDialog
        │   │       └── ImageUpload
        │   ├── AdminFeatures
        │   │   ├── FeaturesList
        │   │   └── FeatureDialog
        │   │       └── IconPicker
        │   └── AdminCTA
        │       └── CTAForm
        │
        ├── AboutPageTab
        │   └── AdminPageContent
        │       ├── HeroSectionForm
        │       ├── StatsSectionForm
        │       ├── ValuesSectionForm
        │       └── PillarsSectionForm
        │
        ├── ContactInfoTab
        │   └── AdminContactInfo
        │       ├── ContactDetailsForm
        │       ├── WorkingHoursForm
        │       └── MapLocationForm
        │
        ├── FAQsTab
        │   └── AdminFAQs
        │       ├── CategoryTabs
        │       ├── FAQsList (Drag-Drop)
        │       └── FAQDialog
        │
        ├── SocialLinksTab
        │   └── AdminSocialLinks
        │       ├── LinksList
        │       └── SocialLinkDialog
        │
        └── SEOTab
            └── AdminSEOSettings
                ├── PageSelector
                ├── MetaTagsForm
                ├── OGTagsForm
                └── TwitterCardForm
```

---

## Security Flow

```
┌──────────────┐
│  Admin User  │
└──────┬───────┘
       │
       │ 1. Login
       ▼
┌──────────────────┐
│  Auth Service    │
│  POST /api/v1/   │
│  auth/login      │
└──────┬───────────┘
       │
       │ 2. Verify Credentials
       ▼
┌──────────────────┐
│  JWT Token       │
│  Generated       │
│  (role: admin)   │
└──────┬───────────┘
       │
       │ 3. Store in Cookie/LocalStorage
       ▼
┌──────────────────┐
│  Admin Makes     │
│  CMS Update      │
└──────┬───────────┘
       │
       │ 4. PATCH /api/v1/settings
       │    Authorization: Bearer <token>
       ▼
┌──────────────────┐
│  Auth Middleware │
│  Verify Token    │
└──────┬───────────┘
       │
       ├─── Invalid Token ──→ 401 Unauthorized
       │
       │ 5. Valid Token ✓
       ▼
┌──────────────────┐
│  Role Check      │
│  isAdmin()?      │
└──────┬───────────┘
       │
       ├─── Not Admin ──→ 403 Forbidden
       │
       │ 6. Is Admin ✓
       ▼
┌──────────────────┐
│  Validation      │
│  Check Input     │
└──────┬───────────┘
       │
       ├─── Invalid Data ──→ 400 Bad Request
       │
       │ 7. Valid Data ✓
       ▼
┌──────────────────┐
│  Sanitization    │
│  Clean Input     │
└──────┬───────────┘
       │
       │ 8. Sanitized ✓
       ▼
┌──────────────────┐
│  Controller      │
│  Process Request │
└──────┬───────────┘
       │
       │ 9. Update Database
       ▼
┌──────────────────┐
│  Success         │
│  200 OK          │
└──────────────────┘
```

---

## Caching Strategy

```
┌─────────────────────────────────────────────────────────────┐
│                    CACHING LAYERS                            │
└─────────────────────────────────────────────────────────────┘

┌──────────────────┐
│  Browser Cache   │  (Static Assets: Images, CSS, JS)
│  (CDN)           │  Cache-Control: max-age=31536000
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  React Query     │  (API Responses)
│  Cache           │  staleTime: 5 minutes
│                  │  cacheTime: 10 minutes
└────────┬─────────┘
         │
         │ Cache Miss
         ▼
┌──────────────────┐
│  API Request     │  GET /api/v1/settings
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  Redis Cache     │  (Optional - Server-side)
│  (Future)        │  TTL: 5 minutes
└────────┬─────────┘
         │
         │ Cache Miss
         ▼
┌──────────────────┐
│  MongoDB Query   │  (Database)
└──────────────────┘

Cache Invalidation:
- Admin updates content → Invalidate React Query cache
- Admin updates content → Clear Redis cache (if implemented)
- Automatic: React Query refetches on window focus
- Manual: Admin can force refresh
```

---

## Image Upload Flow

```
┌──────────────┐
│  Admin User  │
└──────┬───────┘
       │
       │ 1. Select Image File
       ▼
┌──────────────────┐
│  ImageUpload     │
│  Component       │
└──────┬───────────┘
       │
       │ 2. Validate
       │    - Size < 5MB
       │    - Type: jpg/png/webp
       ▼
┌──────────────────┐
│  FormData        │
│  Prepare Upload  │
└──────┬───────────┘
       │
       │ 3. POST /api/v1/settings/logo
       │    Content-Type: multipart/form-data
       ▼
┌──────────────────┐
│  Multer          │
│  Middleware      │
└──────┬───────────┘
       │
       │ 4. Parse File
       ▼
┌──────────────────┐
│  Cloudinary      │
│  Upload          │
└──────┬───────────┘
       │
       │ 5. Store Image
       │    Return URL
       ▼
┌──────────────────┐
│  Controller      │
│  Save URL to DB  │
└──────┬───────────┘
       │
       │ 6. Update Document
       ▼
┌──────────────────┐
│  MongoDB         │
│  siteLogo: URL   │
└──────┬───────────┘
       │
       │ 7. Return Response
       ▼
┌──────────────────┐
│  Admin UI        │
│  Show Preview    │
└──────────────────┘
```

---

## Error Handling Flow

```
┌──────────────┐
│  API Request │
└──────┬───────┘
       │
       ▼
┌──────────────────┐
│  Try-Catch       │
│  in Controller   │
└──────┬───────────┘
       │
       ├─── Success ──→ 200 OK
       │
       │ Error Occurred
       ▼
┌──────────────────┐
│  Error Handler   │
│  Middleware      │
└──────┬───────────┘
       │
       ├─── Validation Error ──→ 400 Bad Request
       ├─── Auth Error ──────→ 401 Unauthorized
       ├─── Permission Error ─→ 403 Forbidden
       ├─── Not Found ───────→ 404 Not Found
       ├─── Server Error ────→ 500 Internal Error
       │
       ▼
┌──────────────────┐
│  Format Error    │
│  Response        │
└──────┬───────────┘
       │
       │ {
       │   status: "error",
       │   message: "...",
       │   errors: [...]
       │ }
       ▼
┌──────────────────┐
│  Frontend        │
│  Error Handling  │
└──────┬───────────┘
       │
       ├─── Show Toast Notification
       ├─── Log to Console (dev)
       ├─── Log to Service (prod)
       └─── Fallback to Default Content
```

---

This architecture ensures:
- ✅ Separation of concerns
- ✅ Scalability
- ✅ Maintainability
- ✅ Security
- ✅ Performance
- ✅ User experience
