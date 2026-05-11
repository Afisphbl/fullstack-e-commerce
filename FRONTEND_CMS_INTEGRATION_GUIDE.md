# Frontend CMS Integration Guide

Quick reference for using the CMS hooks and API functions in the frontend.

## 📚 Available Hooks

### Site Settings

```typescript
import { useSiteSettings, useUpdateSiteSettings } from '@/hooks/useSiteSettings';

// In your component
const { data: settings, isLoading, error } = useSiteSettings();

// Access data
const siteName = settings?.siteName;
const logo = settings?.logo;
const contactEmail = settings?.contactEmail;
```

### Hero Slides

```typescript
import { useHeroSlides } from '@/hooks/useHeroSlides';

const { data: slides, isLoading } = useHeroSlides();

// Render slides
{slides?.map(slide => (
  <div key={slide._id}>
    <img src={slide.image} alt={slide.title} />
    <h2>{slide.title}</h2>
    <p>{slide.subtitle}</p>
  </div>
))}
```

### Features

```typescript
import { useFeatures } from '@/hooks/useFeatures';
import * as LucideIcons from 'lucide-react';

const { data: features } = useFeatures();

// Get icon dynamically
const getIcon = (iconName: string) => {
  const Icon = (LucideIcons as any)[iconName];
  return Icon || Zap;
};

// Render features
{features?.map(feature => {
  const Icon = getIcon(feature.icon);
  return (
    <div key={feature._id}>
      <Icon className="h-6 w-6" />
      <h3>{feature.title}</h3>
      <p>{feature.description}</p>
    </div>
  );
})}
```

### Page Content

```typescript
import { usePageContent } from '@/hooks/usePageContent';

const { data: content, isLoading } = usePageContent('home');

// Get specific section
const heroSection = content?.sections?.find(s => s.key === 'hero');
const title = heroSection?.title;
const description = heroSection?.description;
```

### FAQs

```typescript
import { useFAQs } from '@/hooks/useFAQs';

const { data: faqs, isLoading, error } = useFAQs();

// Group by category
const categories = [...new Set(faqs?.map(f => f.category))];
```

### Social Links

```typescript
import { useSocialLinks } from '@/hooks/useSocialLinks';

const { data: links } = useSocialLinks();

// Render social links
{links?.map(link => (
  <a key={link._id} href={link.url} target="_blank">
    <Icon className="h-4 w-4" />
  </a>
))}
```

### SEO Settings

```typescript
import { useSEOSettings } from '@/hooks/useSEOSettings';

const { data: seo } = useSEOSettings('home');

// Use in Helmet
<Helmet>
  <title>{seo?.metaTitle}</title>
  <meta name="description" content={seo?.metaDescription} />
</Helmet>
```

## 🎨 Loading States Pattern

```typescript
import { ContentSkeleton } from '@/components/shared/ContentSkeleton';

const MyComponent = () => {
  const { data, isLoading, error } = useHook();

  if (isLoading) {
    return <ContentSkeleton lines={5} showImage />;
  }

  if (error) {
    return <div>Error loading content</div>;
  }

  return <div>{/* Render data */}</div>;
};
```

## 🔄 Fallback Pattern

```typescript
const { data: apiData } = useHook();

// Define defaults
const defaultData = {
  title: 'Default Title',
  description: 'Default description',
};

// Use with fallback
const displayData = apiData || defaultData;
const title = apiData?.title || defaultData.title;
```

## 🎯 Dynamic Icon Rendering

```typescript
import * as LucideIcons from 'lucide-react';
import { Zap } from 'lucide-react';

const getIconComponent = (iconName: string) => {
  const Icon = (LucideIcons as any)[iconName];
  return Icon || Zap; // Fallback icon
};

// Usage
const Icon = getIconComponent('Truck');
<Icon className="h-6 w-6 text-primary" />
```

## 📦 Available Skeleton Components

### HeroSkeleton
```typescript
import { HeroSkeleton } from '@/components/shared/HeroSkeleton';

{isLoading ? <HeroSkeleton /> : <HeroSection />}
```

### FeaturesSkeleton
```typescript
import { FeaturesSkeleton } from '@/components/shared/FeaturesSkeleton';

{isLoading ? <FeaturesSkeleton /> : <FeaturesSection />}
```

### ContentSkeleton
```typescript
import { ContentSkeleton } from '@/components/shared/ContentSkeleton';

<ContentSkeleton 
  lines={5}        // Number of text lines
  showImage={true} // Show image placeholder
  className="my-4" // Custom classes
/>
```

## 🔧 Mutation Hooks (Admin)

### Creating Content

```typescript
import { useCreateHeroSlide } from '@/hooks/useHeroSlides';
import { toast } from 'sonner';

const createSlide = useCreateHeroSlide();

const handleCreate = async (data: FormData) => {
  try {
    await createSlide.mutateAsync(data);
    toast.success('Slide created!');
  } catch (error) {
    toast.error('Failed to create slide');
  }
};
```

### Updating Content

```typescript
import { useUpdateFeature } from '@/hooks/useFeatures';

const updateFeature = useUpdateFeature();

const handleUpdate = (id: string, data: Partial<Feature>) => {
  updateFeature.mutate({ id, data }, {
    onSuccess: () => toast.success('Updated!'),
    onError: () => toast.error('Failed to update'),
  });
};
```

### Deleting Content

```typescript
import { useDeleteFAQ } from '@/hooks/useFAQs';

const deleteFAQ = useDeleteFAQ();

const handleDelete = (id: string) => {
  if (confirm('Are you sure?')) {
    deleteFAQ.mutate(id);
  }
};
```

## 🎨 Common Patterns

### Section with CMS Content

```typescript
const MySection = () => {
  const { data: content, isLoading } = usePageContent('mypage');
  
  const section = content?.sections?.find(s => s.key === 'mysection');
  const title = section?.title || 'Default Title';
  const description = section?.description || 'Default description';
  
  if (isLoading) return <ContentSkeleton />;
  
  return (
    <section>
      <h2>{title}</h2>
      <p>{description}</p>
    </section>
  );
};
```

### List with Loading and Empty States

```typescript
const MyList = () => {
  const { data: items, isLoading } = useItems();
  
  if (isLoading) {
    return <div>Loading...</div>;
  }
  
  if (!items || items.length === 0) {
    return <div>No items found</div>;
  }
  
  return (
    <div>
      {items.map(item => (
        <div key={item._id}>{item.title}</div>
      ))}
    </div>
  );
};
```

### Form with Mutation

```typescript
const MyForm = () => {
  const updateMutation = useUpdateContent();
  
  const onSubmit = (data: FormData) => {
    updateMutation.mutate(data, {
      onSuccess: () => {
        toast.success('Saved!');
        reset();
      },
      onError: (error) => {
        toast.error(error.message);
      },
    });
  };
  
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* form fields */}
      <button 
        type="submit" 
        disabled={updateMutation.isPending}
      >
        {updateMutation.isPending ? 'Saving...' : 'Save'}
      </button>
    </form>
  );
};
```

## 🚀 Best Practices

### 1. Always Handle Loading States
```typescript
if (isLoading) return <Skeleton />;
```

### 2. Always Handle Errors
```typescript
if (error) return <ErrorMessage />;
```

### 3. Use Fallbacks
```typescript
const value = data?.field || 'default';
```

### 4. Invalidate Queries After Mutations
```typescript
// This is handled automatically by the hooks
// But you can manually invalidate if needed:
queryClient.invalidateQueries({ queryKey: ['key'] });
```

### 5. Use Optimistic Updates for Better UX
```typescript
// Already implemented in mutation hooks
// Data updates immediately, then syncs with server
```

### 6. Cache Configuration
```typescript
// Already configured in hooks:
// - staleTime: 5-10 minutes
// - retry: 1-2 times
// - refetchOnWindowFocus: false
```

## 📖 Type Definitions

All types are exported from `@/lib/api`:

```typescript
import type {
  SiteSettings,
  HeroSlide,
  Feature,
  PageContent,
  PageContentSection,
  FAQExtended,
  SocialLink,
  SEOSettings,
} from '@/lib/api';
```

## 🔍 Debugging

### Check Query Status
```typescript
const query = useHook();
console.log({
  isLoading: query.isLoading,
  isError: query.isError,
  error: query.error,
  data: query.data,
});
```

### Check React Query DevTools
React Query DevTools are available in development mode to inspect queries and mutations.

## 📚 Additional Resources

- React Query Docs: https://tanstack.com/query/latest
- Lucide Icons: https://lucide.dev/icons/
- Project API Documentation: See `Backend/README.md`

---

**Last Updated:** May 11, 2026  
**Version:** 1.0.0
