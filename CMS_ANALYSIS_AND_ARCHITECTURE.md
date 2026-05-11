# E-Commerce CMS Analysis & Architecture

## Executive Summary

This document provides a comprehensive analysis of your e-commerce website's hardcoded content and proposes a simple Content Management System (CMS) architecture to make existing pages dynamic and manageable from the admin panel.

**Key Principle**: Keep the website structure fixed. Only make existing content dynamic.

---

## 1. FRONTEND ANALYSIS - Hardcoded Content Identified

### 1.1 Homepage (`Frontend/src/pages/Index.tsx`)

#### **Hero Section** ✅ NEEDS TO BE DYNAMIC
- **Hero Slides** (currently 3 hardcoded slides):
  ```typescript
  const heroSlides = [
    {
      image: "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=1200",
      title: "Powerful Laptops",
      subtitle: "Built for creators and pros",
    },
    // ... 2 more slides
  ];
  ```
  - **What needs to change**: Images, titles, subtitles, slide order
  - **Admin should control**: Add/remove/reorder slides, change images/text

#### **Hero Text Content** ✅ NEEDS TO BE DYNAMIC
- Main heading: "Experience The **Future** Of Technology"
- Subheading: "NEXT-GEN ELECTRONICS"
- Description paragraph
- Button texts: "Shop Now", "Learn More"

#### **Features Section** ✅ NEEDS TO BE DYNAMIC
```typescript
{
  icon: Truck,
  title: "Free Shipping",
  desc: "On orders over $100",
}
```
- 3 feature cards with icons, titles, descriptions
- **Admin should control**: Icon selection, title, description, visibility

#### **Section Titles** ✅ NEEDS TO BE DYNAMIC
- "Shop by Category"
- "Featured Products"
- "New Arrivals"
- "Ready to Upgrade?" (CTA section)

#### **CTA Section** ✅ NEEDS TO BE DYNAMIC
- Title: "Ready to Upgrade?"
- Description text
- Button text and link

---

### 1.2 About Page (`Frontend/src/pages/AboutPage.tsx`)

#### **Hero Section** ✅ NEEDS TO BE DYNAMIC
- Badge text: "WHO WE ARE"
- Main title: "About **VoltEdge**"
- Description paragraph
- Hero image

#### **Statistics Section** ✅ NEEDS TO BE DYNAMIC
```typescript
{ icon: Users, value: "2M+", label: "Happy Customers" },
{ icon: Globe, value: "50+", label: "Countries" },
{ icon: Zap, value: "10K+", label: "Products" },
{ icon: Award, value: "99%", label: "Satisfaction" },
```

#### **Core Values Section** ✅ NEEDS TO BE DYNAMIC
- Section title: "Our Core Values"
- Section description
- 4 value cards with icons, titles, descriptions

#### **Strategic Pillars** ✅ NEEDS TO BE DYNAMIC
- 3 pillar cards with titles and descriptions

---

### 1.3 Contact Page (`Frontend/src/pages/ContactPage.tsx`)

#### **Contact Information** ✅ NEEDS TO BE DYNAMIC
```typescript
{ icon: Mail, title: "Email", info: "abuabdurehman0308@gmail.com" },
{ icon: Phone, title: "Phone", info: "+251993877913" },
{ icon: MapPin, title: "Address", info: "Addis Ababa, Ethiopia" },
```

#### **Working Hours** ✅ NEEDS TO BE DYNAMIC
- Mon - Fri: 9:00 AM - 8:00 PM
- Saturday: 10:00 AM - 6:00 PM
- Sunday: 11:00 AM - 4:00 PM

#### **Social Media Links** ✅ NEEDS TO BE DYNAMIC
- Facebook, Instagram, LinkedIn, Twitter links (currently "#")

#### **Map Location** ✅ NEEDS TO BE DYNAMIC
- Google Maps embed coordinates

---

### 1.4 Header (`Frontend/src/components/layout/Header.tsx`)

#### **Branding** ✅ NEEDS TO BE DYNAMIC
- Logo text: "VOLTEDGE"
- Logo image (if added)

#### **Navigation Links** ✅ NEEDS TO BE DYNAMIC
```typescript
const navLinks = [
  { to: "/", label: "Home" },
  { to: "/shop", label: "Shop" },
  { to: "/blog", label: "Blog" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
  { to: "/faq", label: "FAQ" },
];
```

---

### 1.5 Footer (`Frontend/src/components/layout/Footer.tsx`)

#### **Company Info** ✅ NEEDS TO BE DYNAMIC
- Brand name: "VOLTEDGE"
- Tagline: "Your premium destination for cutting-edge electronics..."

#### **Footer Links** ✅ NEEDS TO BE DYNAMIC
- Quick Links section
- Account section

#### **Contact Info** ✅ NEEDS TO BE DYNAMIC
- Email: support@voltedge.com
- Phone: +1 (555) 123-4567
- Address: San Francisco, CA

#### **Copyright** ✅ NEEDS TO BE DYNAMIC
- "© 2026 VoltEdge. All rights reserved."

---

### 1.6 FAQ Page (`Frontend/src/pages/FAQPage.tsx`)

#### **Current Status**: ✅ PARTIALLY DYNAMIC
- FAQs are loaded from `Frontend/src/data/faqs.json`
- **Issue**: Static JSON file, not manageable from admin panel
- **Needs**: Backend API + Admin interface

---

### 1.7 Blog Pages

#### **Current Status**: ❌ STATIC JSON
- Blogs loaded from `Frontend/src/data/blogs.json`
- **Needs**: Full blog management system (separate from CMS scope, but noted)

---

## 2. BACKEND ANALYSIS

### 2.1 Existing Models
✅ **Already Exists**:
- `userModel.js` - User management
- `productModel.js` - Products
- `categoryModel.js` - Categories
- `orderModel.js` - Orders
- `cartModel.js` - Shopping cart
- `reviewModel.js` - Product reviews
- `couponModel.js` - Discount coupons
- `messageModel.js` - Contact messages
- `specificationModel.js` - Product specifications

### 2.2 Missing Models for CMS
❌ **NEEDS TO BE CREATED**:
1. **Site Settings Model** - General site configuration
2. **Page Content Model** - Dynamic page content
3. **Hero Slides Model** - Homepage hero carousel
4. **Features Model** - Homepage features section
5. **FAQ Model** - FAQ management
6. **Social Links Model** - Social media links
7. **SEO Settings Model** - Meta tags, titles, descriptions

### 2.3 Existing Routes
✅ **Already Exists**:
- `/api/v1/auth` - Authentication
- `/api/v1/users` - User management
- `/api/v1/products` - Products
- `/api/v1/categories` - Categories
- `/api/v1/orders` - Orders
- `/api/v1/reviews` - Reviews
- `/api/v1/coupons` - Coupons
- `/api/v1/cart` - Cart
- `/api/v1/messages` - Contact messages
- `/api/v1/payments` - Payments
- `/api/v1/wishlist` - Wishlist
- `/api/v1/specifications` - Product specs

### 2.4 Missing Routes for CMS
❌ **NEEDS TO BE CREATED**:
1. `/api/v1/settings` - Site settings CRUD
2. `/api/v1/content` - Page content CRUD
3. `/api/v1/hero-slides` - Hero slides CRUD
4. `/api/v1/features` - Features CRUD
5. `/api/v1/faqs` - FAQ CRUD
6. `/api/v1/social-links` - Social links CRUD
7. `/api/v1/seo` - SEO settings CRUD

---

## 3. PROPOSED CMS ARCHITECTURE

### 3.1 Database Structure

#### **Model 1: Site Settings**
```javascript
// Backend/models/siteSettingsModel.js
const siteSettingsSchema = new mongoose.Schema({
  // Branding
  siteName: { type: String, required: true, default: 'VOLTEDGE' },
  siteTagline: { type: String, default: 'Your premium destination...' },
  siteLogo: { type: String }, // URL or path
  siteFavicon: { type: String },
  
  // Contact Information
  contactEmail: { type: String },
  contactPhone: { type: String },
  contactAddress: { type: String },
  
  // Map
  mapLatitude: { type: Number },
  mapLongitude: { type: Number },
  mapEmbedUrl: { type: String },
  
  // Working Hours
  workingHours: {
    monday: { type: String, default: '9:00 AM - 8:00 PM' },
    tuesday: { type: String, default: '9:00 AM - 8:00 PM' },
    wednesday: { type: String, default: '9:00 AM - 8:00 PM' },
    thursday: { type: String, default: '9:00 AM - 8:00 PM' },
    friday: { type: String, default: '9:00 AM - 8:00 PM' },
    saturday: { type: String, default: '10:00 AM - 6:00 PM' },
    sunday: { type: String, default: '11:00 AM - 4:00 PM' },
  },
  
  // Footer
  footerText: { type: String },
  copyrightText: { type: String, default: '© 2026 VoltEdge. All rights reserved.' },
  
  // Metadata
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

// Singleton pattern - only one settings document
siteSettingsSchema.statics.getInstance = async function() {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({});
  }
  return settings;
};
```

#### **Model 2: Hero Slides**
```javascript
// Backend/models/heroSlideModel.js
const heroSlideSchema = new mongoose.Schema({
  title: { type: String, required: true },
  subtitle: { type: String, required: true },
  image: { type: String, required: true },
  buttonText: { type: String, default: 'Shop Now' },
  buttonLink: { type: String, default: '/shop' },
  order: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });
```

#### **Model 3: Features**
```javascript
// Backend/models/featureModel.js
const featureSchema = new mongoose.Schema({
  icon: { type: String, required: true }, // Icon name (Truck, Shield, Zap, etc.)
  title: { type: String, required: true },
  description: { type: String, required: true },
  order: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });
```

#### **Model 4: Page Content**
```javascript
// Backend/models/pageContentModel.js
const pageContentSchema = new mongoose.Schema({
  page: { 
    type: String, 
    required: true, 
    enum: ['home', 'about', 'contact', 'faq'],
    unique: true 
  },
  sections: [{
    key: { type: String, required: true }, // e.g., 'hero', 'cta', 'stats'
    title: { type: String },
    subtitle: { type: String },
    description: { type: String },
    image: { type: String },
    buttonText: { type: String },
    buttonLink: { type: String },
    items: [{ // For lists like stats, values, pillars
      icon: String,
      title: String,
      description: String,
      value: String,
      label: String,
      order: Number,
    }],
  }],
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });
```

#### **Model 5: FAQ**
```javascript
// Backend/models/faqModel.js
const faqSchema = new mongoose.Schema({
  question: { type: String, required: true },
  answer: { type: String, required: true },
  category: { 
    type: String, 
    required: true,
    enum: ['General', 'Shipping', 'Returns', 'Payment', 'Orders', 'Warranty', 'Pricing']
  },
  order: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });
```

#### **Model 6: Social Links**
```javascript
// Backend/models/socialLinkModel.js
const socialLinkSchema = new mongoose.Schema({
  platform: { 
    type: String, 
    required: true,
    enum: ['facebook', 'instagram', 'twitter', 'linkedin', 'youtube', 'tiktok']
  },
  url: { type: String, required: true },
  icon: { type: String }, // Icon name
  order: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });
```

#### **Model 7: SEO Settings**
```javascript
// Backend/models/seoSettingsModel.js
const seoSettingsSchema = new mongoose.Schema({
  page: { 
    type: String, 
    required: true,
    enum: ['home', 'shop', 'about', 'contact', 'faq', 'blog'],
    unique: true
  },
  metaTitle: { type: String, required: true },
  metaDescription: { type: String, required: true },
  metaKeywords: [String],
  ogTitle: { type: String },
  ogDescription: { type: String },
  ogImage: { type: String },
  twitterCard: { type: String, default: 'summary_large_image' },
  canonicalUrl: { type: String },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });
```

---

### 3.2 API Endpoints

#### **Site Settings API**
```
GET    /api/v1/settings              - Get site settings (public)
PATCH  /api/v1/settings              - Update settings (admin only)
POST   /api/v1/settings/logo         - Upload logo (admin only)
POST   /api/v1/settings/favicon      - Upload favicon (admin only)
```

#### **Hero Slides API**
```
GET    /api/v1/hero-slides           - Get all active slides (public)
GET    /api/v1/hero-slides/admin     - Get all slides (admin only)
POST   /api/v1/hero-slides           - Create slide (admin only)
PATCH  /api/v1/hero-slides/:id       - Update slide (admin only)
DELETE /api/v1/hero-slides/:id       - Delete slide (admin only)
PATCH  /api/v1/hero-slides/:id/reorder - Reorder slides (admin only)
```

#### **Features API**
```
GET    /api/v1/features              - Get all active features (public)
GET    /api/v1/features/admin        - Get all features (admin only)
POST   /api/v1/features              - Create feature (admin only)
PATCH  /api/v1/features/:id          - Update feature (admin only)
DELETE /api/v1/features/:id          - Delete feature (admin only)
```

#### **Page Content API**
```
GET    /api/v1/content/:page         - Get page content (public)
PATCH  /api/v1/content/:page         - Update page content (admin only)
POST   /api/v1/content/:page/image   - Upload section image (admin only)
```

#### **FAQ API**
```
GET    /api/v1/faqs                  - Get all active FAQs (public)
GET    /api/v1/faqs/admin            - Get all FAQs (admin only)
POST   /api/v1/faqs                  - Create FAQ (admin only)
PATCH  /api/v1/faqs/:id              - Update FAQ (admin only)
DELETE /api/v1/faqs/:id              - Delete FAQ (admin only)
```

#### **Social Links API**
```
GET    /api/v1/social-links          - Get all active links (public)
POST   /api/v1/social-links          - Create link (admin only)
PATCH  /api/v1/social-links/:id      - Update link (admin only)
DELETE /api/v1/social-links/:id      - Delete link (admin only)
```

#### **SEO Settings API**
```
GET    /api/v1/seo/:page             - Get SEO settings for page (public)
PATCH  /api/v1/seo/:page             - Update SEO settings (admin only)
POST   /api/v1/seo/:page/og-image    - Upload OG image (admin only)
```

---

### 3.3 Frontend Refactoring Strategy

#### **Step 1: Create API Hooks**
```typescript
// Frontend/src/hooks/useSiteSettings.ts
export const useSiteSettings = () => {
  return useQuery({
    queryKey: ['siteSettings'],
    queryFn: () => apiFetch('/api/v1/settings'),
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
};

// Frontend/src/hooks/useHeroSlides.ts
export const useHeroSlides = () => {
  return useQuery({
    queryKey: ['heroSlides'],
    queryFn: () => apiFetch('/api/v1/hero-slides'),
  });
};

// Similar hooks for features, FAQs, social links, etc.
```

#### **Step 2: Refactor Components**

**Before (Hardcoded)**:
```typescript
const heroSlides = [
  { image: "...", title: "Powerful Laptops", subtitle: "..." },
];
```

**After (Dynamic)**:
```typescript
const { data: heroSlides, isLoading } = useHeroSlides();

if (isLoading) return <HeroSkeleton />;

return (
  <div>
    {heroSlides?.map((slide) => (
      <img src={slide.image} alt={slide.title} />
    ))}
  </div>
);
```

#### **Step 3: Handle Loading States**
```typescript
// Show skeleton loaders while fetching
{isLoading && <SkeletonLoader />}
{error && <ErrorMessage />}
{data && <ActualContent data={data} />}
```

#### **Step 4: Handle Missing Content**
```typescript
// Fallback to defaults if API fails
const { data: settings } = useSiteSettings();
const siteName = settings?.siteName || 'VOLTEDGE';
const contactEmail = settings?.contactEmail || 'support@voltedge.com';
```

---

### 3.4 Admin Dashboard Interface

#### **New Admin Page: Content Management**
```
/admin/content
  ├── Site Settings
  ├── Homepage Content
  │   ├── Hero Slides
  │   ├── Features
  │   └── CTA Section
  ├── About Page Content
  ├── Contact Information
  ├── FAQs
  ├── Social Links
  └── SEO Settings
```

#### **Admin Features**:

1. **Site Settings Tab**
   - Text inputs for site name, tagline
   - Image upload for logo, favicon
   - Contact information form
   - Working hours editor
   - Map location (lat/lng or embed URL)

2. **Hero Slides Manager**
   - List of slides with drag-to-reorder
   - Add/Edit/Delete slide modal
   - Image upload with preview
   - Title, subtitle, button text/link fields
   - Active/Inactive toggle

3. **Features Manager**
   - List of features
   - Icon picker (from Lucide icons)
   - Title and description fields
   - Reorder functionality

4. **Page Content Editor**
   - Select page (Home, About, Contact, FAQ)
   - Section-based editor
   - Rich text editor for descriptions
   - Image uploads for sections

5. **FAQ Manager**
   - Category filter
   - Add/Edit/Delete FAQ
   - Drag-to-reorder within categories
   - Active/Inactive toggle

6. **Social Links Manager**
   - Platform selector
   - URL input
   - Active/Inactive toggle

7. **SEO Settings**
   - Page selector
   - Meta title, description, keywords
   - Open Graph settings
   - Twitter Card settings
   - OG image upload

---

## 4. IMPLEMENTATION ROADMAP

### Phase 1: Backend Setup (Week 1)
1. ✅ Create all 7 models
2. ✅ Create controllers for each model
3. ✅ Create routes for each API endpoint
4. ✅ Add authentication/authorization middleware
5. ✅ Seed initial data from hardcoded values
6. ✅ Test all endpoints with Postman

### Phase 2: Frontend API Integration (Week 2)
1. ✅ Create API functions in `lib/api.ts`
2. ✅ Create React Query hooks
3. ✅ Refactor Homepage to use dynamic data
4. ✅ Refactor About page to use dynamic data
5. ✅ Refactor Contact page to use dynamic data
6. ✅ Refactor Header to use dynamic data
7. ✅ Refactor Footer to use dynamic data
8. ✅ Refactor FAQ page to use dynamic data

### Phase 3: Admin Interface (Week 3)
1. ✅ Create admin content management page
2. ✅ Build Site Settings form
3. ✅ Build Hero Slides manager
4. ✅ Build Features manager
5. ✅ Build Page Content editor
6. ✅ Build FAQ manager
7. ✅ Build Social Links manager
8. ✅ Build SEO Settings editor

### Phase 4: Testing & Polish (Week 4)
1. ✅ Test all CRUD operations
2. ✅ Test image uploads
3. ✅ Test loading states and error handling
4. ✅ Test fallback to defaults
5. ✅ Mobile responsiveness
6. ✅ Performance optimization (caching)
7. ✅ Documentation

---

## 5. KEY TECHNICAL DECISIONS

### 5.1 Caching Strategy
- **Frontend**: React Query with 5-minute stale time for public content
- **Backend**: Consider Redis for frequently accessed settings
- **CDN**: Use Cloudinary for images with CDN caching

### 5.2 Image Management
- Use existing Cloudinary integration
- Store image URLs in database
- Admin uploads through Cloudinary API
- Automatic image optimization

### 5.3 Data Validation
- Use Joi/Zod for request validation
- Sanitize all user inputs
- Validate image uploads (size, format)
- Enforce character limits on text fields

### 5.4 Security
- Admin-only routes protected by role-based middleware
- Rate limiting on public endpoints
- Input sanitization to prevent XSS
- CSRF protection on state-changing operations

### 5.5 SEO Considerations
- Server-side rendering (if using Next.js) or meta tag injection
- Dynamic meta tags based on SEO settings
- Structured data (JSON-LD) for rich snippets
- Sitemap generation

---

## 6. WHAT THIS CMS DOES NOT DO

❌ **NOT Included** (as per requirements):
- Page builder / drag-and-drop editor
- Dynamic route creation
- Unlimited page creation
- Custom page templates
- Blog post management (separate feature)
- Product management (already exists)
- Order management (already exists)

✅ **Only Manages**:
- Existing page content
- Site-wide settings
- Static content sections
- SEO metadata
- Contact information
- FAQs

---

## 7. EXAMPLE: Homepage Before & After

### Before (Hardcoded)
```typescript
<h1>Experience The <span>Future</span> Of Technology</h1>
<p>Discover cutting-edge electronics...</p>
```

### After (Dynamic)
```typescript
const { data: homeContent } = usePageContent('home');

<h1>{homeContent?.hero?.title || 'Experience The Future Of Technology'}</h1>
<p>{homeContent?.hero?.description || 'Discover cutting-edge electronics...'}</p>
```

### Admin Interface
```
[Site Settings] > [Homepage Content] > [Hero Section]
┌─────────────────────────────────────┐
│ Title: [Experience The Future...]   │
│ Description: [Discover cutting...]  │
│ Button Text: [Shop Now]             │
│ Button Link: [/shop]                │
│ [Save Changes]                      │
└─────────────────────────────────────┘
```

---

## 8. MIGRATION STRATEGY

### Step 1: Create Seed Script
```javascript
// Backend/utils/seedCMSData.js
// Extract all hardcoded content and insert into database
```

### Step 2: Gradual Rollout
1. Deploy backend with new models/APIs
2. Seed database with current hardcoded values
3. Update frontend components one by one
4. Test each component before moving to next
5. Keep fallbacks to hardcoded values during transition

### Step 3: Admin Training
- Create admin user guide
- Document each CMS feature
- Provide video tutorials
- Set up staging environment for testing

---

## 9. ESTIMATED EFFORT

| Phase | Tasks | Estimated Time |
|-------|-------|----------------|
| Backend Models & APIs | 7 models, controllers, routes | 3-4 days |
| Frontend API Integration | Hooks, refactoring pages | 4-5 days |
| Admin Interface | 7 management interfaces | 5-6 days |
| Testing & Polish | QA, bug fixes, optimization | 3-4 days |
| **Total** | | **15-19 days** |

---

## 10. NEXT STEPS

1. **Review this document** with stakeholders
2. **Approve the architecture** and database structure
3. **Prioritize features** (which to build first)
4. **Set up development environment**
5. **Begin Phase 1: Backend Setup**

---

## APPENDIX A: Complete List of Dynamic Content

### Homepage
- [ ] Hero slides (images, titles, subtitles)
- [ ] Hero main heading
- [ ] Hero description
- [ ] Hero buttons
- [ ] Features section (3 cards)
- [ ] Section titles (Categories, Featured, New Arrivals, CTA)
- [ ] CTA section (title, description, button)

### About Page
- [ ] Hero badge text
- [ ] Hero title
- [ ] Hero description
- [ ] Hero image
- [ ] Statistics (4 stats)
- [ ] Core values section title & description
- [ ] Core values (4 cards)
- [ ] Strategic pillars (3 cards)

### Contact Page
- [ ] Page title & description
- [ ] Contact email
- [ ] Contact phone
- [ ] Contact address
- [ ] Working hours (7 days)
- [ ] Social media links (4 platforms)
- [ ] Map location

### Header
- [ ] Site logo/name
- [ ] Navigation links (6 links)

### Footer
- [ ] Brand name
- [ ] Tagline
- [ ] Quick links
- [ ] Contact info
- [ ] Copyright text

### FAQ Page
- [ ] All FAQs (currently 8, should be unlimited)
- [ ] FAQ categories

### SEO
- [ ] Meta titles (all pages)
- [ ] Meta descriptions (all pages)
- [ ] OG images (all pages)
- [ ] Keywords (all pages)

---

**Total Dynamic Elements**: ~60+ content pieces across 6 pages

---

## APPENDIX B: Icon Management

For features, values, and other icon-based content, use **Lucide React** icons (already in project).

**Admin Interface**:
- Dropdown with icon preview
- Search functionality
- Common icons: Truck, Shield, Zap, Users, Globe, Award, etc.

**Storage**:
- Store icon name as string (e.g., "Truck")
- Frontend renders: `<Icon name={iconName} />`

---

## APPENDIX C: Sample Admin API Calls

### Get Site Settings
```bash
GET /api/v1/settings
Response:
{
  "status": "success",
  "data": {
    "siteName": "VOLTEDGE",
    "contactEmail": "support@voltedge.com",
    ...
  }
}
```

### Update Site Settings
```bash
PATCH /api/v1/settings
Authorization: Bearer <admin-token>
Body:
{
  "siteName": "VoltEdge Pro",
  "contactEmail": "hello@voltedge.com"
}
```

### Create Hero Slide
```bash
POST /api/v1/hero-slides
Authorization: Bearer <admin-token>
Body:
{
  "title": "New Slide",
  "subtitle": "Amazing products",
  "image": "https://...",
  "order": 3
}
```

---

**End of Document**

This CMS architecture provides a simple, maintainable solution for managing existing page content without introducing complexity of a full page builder system.
