# Admin Dashboard Design Specifications

## 🎨 Visual Design Overview

### Layout Structure

```
┌─────────────────────────────────────────────────────────────────┐
│  SIDEBAR (64px)    │  MAIN CONTENT AREA                         │
│                    │                                             │
│  ┌──────────┐     │  ┌─────────────────────────────────────┐  │
│  │   LOGO   │     │  │  TOP HEADER (64px)                  │  │
│  └──────────┘     │  │  Search | Notifications | Profile   │  │
│                    │  └─────────────────────────────────────┘  │
│  Dashboard         │                                             │
│  Users ◄──         │  ┌─────────────────────────────────────┐  │
│  Products          │  │  PAGE TITLE & DESCRIPTION           │  │
│  Orders            │  └─────────────────────────────────────┘  │
│  Categories        │                                             │
│  Analytics         │  ┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐ │
│  Settings          │  │ STAT  │ │ STAT  │ │ STAT  │ │ STAT  │ │
│                    │  │ CARD  │ │ CARD  │ │ CARD  │ │ CARD  │ │
│                    │  └───────┘ └───────┘ └───────┘ └───────┘ │
│                    │                                             │
│  ┌──────────┐     │  ┌─────────────────────────────────────┐  │
│  │  ADMIN   │     │  │  FILTERS & SEARCH                   │  │
│  │  PROFILE │     │  └─────────────────────────────────────┘  │
│  └──────────┘     │                                             │
│                    │  ┌─────────────────────────────────────┐  │
│                    │  │  USER TABLE                         │  │
│                    │  │  ┌───────────────────────────────┐ │  │
│                    │  │  │ Avatar | Name | Role | Status │ │  │
│                    │  │  ├───────────────────────────────┤ │  │
│                    │  │  │ Avatar | Name | Role | Status │ │  │
│                    │  │  └───────────────────────────────┘ │  │
│                    │  └─────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## 📐 Component Specifications

### 1. Stats Cards (Top Row)

**Dimensions**: 
- Height: 120px
- Width: Responsive (1/4 of container)
- Gap: 16px between cards

**Visual Elements**:
```
┌─────────────────────────────┐
│ Total Users        [ICON]   │  ← Title + Icon (right aligned)
│                              │
│ 7                            │  ← Large number (3xl font)
│                              │
│ +12% from last month         │  ← Trend indicator (green/red)
└─────────────────────────────┘
```

**Colors**:
- Background: White (light) / Dark gray (dark mode)
- Icon background: Primary color with 10% opacity
- Icon: Primary color
- Trend positive: Green (#10B981)
- Trend negative: Red (#EF4444)

**Hover Effect**: Subtle shadow elevation

### 2. User Table

**Column Structure**:
| Column | Width | Content |
|--------|-------|---------|
| User | 25% | Avatar (40px) + Name + Email |
| Contact | 15% | Phone number |
| Role | 10% | Badge component |
| Status | 10% | Badge component |
| Registration | 15% | Date |
| Last Login | 15% | Timestamp |
| Actions | 10% | Dropdown menu |

**Row Specifications**:
- Height: 72px
- Padding: 16px vertical, 16px horizontal
- Border: 1px solid border color
- Hover: Background changes to muted/50

**Avatar Design**:
```
┌──────────┐
│    AS    │  ← Initials (if no image)
└──────────┘
```
- Size: 40x40px
- Border radius: 50% (circle)
- Background: Primary/10
- Text: Primary color, font-semibold

### 3. Badge Components

**Role Badges**:
- Admin: Blue background, white text
- Staff: Gray background, dark text
- Customer: Outlined, no fill

**Status Badges**:
- Active: Green background (#10B981)
- Suspended: Red background (#EF4444)
- Pending: Yellow background (#F59E0B)

**Dimensions**:
- Height: 24px
- Padding: 4px 12px
- Border radius: 12px (pill shape)
- Font size: 12px
- Font weight: 500

### 4. Action Dropdown Menu

**Trigger Button**:
- Size: 32x32px
- Icon: MoreVertical (3 dots)
- Hover: Background muted

**Menu Items**:
```
┌─────────────────────────┐
│ Actions                 │  ← Header
├─────────────────────────┤
│ 👁 View Details         │
│ ✏️ Edit User            │
│ 🚫 Suspend Account      │
│ ✉️ Send Message         │
├─────────────────────────┤
│ 🗑️ Delete User          │  ← Red text
└─────────────────────────┘
```

**Specifications**:
- Width: 192px
- Item height: 36px
- Icon size: 16px
- Gap between icon and text: 8px
- Hover: Background muted

### 5. Modals

**User Details Modal**:
```
┌─────────────────────────────────────┐
│ User Details                    [X] │
│ Complete information about user     │
├─────────────────────────────────────┤
│                                     │
│     ┌────────┐                      │
│     │  AVATAR│  John Doe            │
│     │  80x80 │  [Admin] [Active]    │
│     └────────┘                      │
│                                     │
│ ─────────────────────────────────── │
│                                     │
│ Contact Information                 │
│ 📧 Email: john@example.com          │
│ 📱 Phone: +1 234 567 8900           │
│                                     │
│ ─────────────────────────────────── │
│                                     │
│ Account Information                 │
│ 🛡️ Role: Admin                      │
│ 📅 Registration: Jan 15, 2024       │
│ 🕐 Last Login: May 7, 2026 10:30 AM │
│                                     │
└─────────────────────────────────────┘
```

**Dimensions**:
- Width: 500px
- Max height: 90vh
- Padding: 24px
- Border radius: 8px

**Edit User Modal**:
- Same width as details modal
- Form fields with labels
- Two-column layout for Role/Status
- Save/Cancel buttons at bottom

**Delete Confirmation**:
- Width: 400px
- Red accent for destructive action
- Clear warning message
- Cancel (outlined) + Delete (red) buttons

### 6. Sidebar Navigation

**Dimensions**:
- Width: 256px (64 in collapsed state)
- Full height
- Fixed position

**Navigation Items**:
```
┌────────────────────────┐
│  [ICON] Dashboard      │  ← Default state
│  [ICON] Users          │  ← Active state (blue bg)
│  [ICON] Products       │
│  [ICON] Orders         │
│  [ICON] Categories     │
│  [ICON] Analytics      │
│  [ICON] Settings       │
└────────────────────────┘
```

**Item Specifications**:
- Height: 40px
- Padding: 10px 12px
- Border radius: 8px
- Gap between icon and text: 12px
- Active: Primary background, white text
- Hover: Muted background

### 7. Top Header

**Height**: 64px
**Layout**: Flex, space-between

**Left Section**:
- Hamburger menu (mobile only)
- Search bar (max-width: 448px)

**Right Section**:
- Dark mode toggle button
- Notifications bell (with badge)
- User profile dropdown

**Search Bar**:
```
┌─────────────────────────────┐
│ 🔍 Search...                │
└─────────────────────────────┘
```
- Height: 40px
- Border radius: 8px
- Icon: 16px, left-aligned with 12px padding

## 🎨 Color Palette

### Light Mode
```css
Background:     #FFFFFF
Foreground:     #0F172A
Card:           #FFFFFF
Border:         #E2E8F0
Muted:          #F1F5F9
Primary:        #3B82F6
Success:        #10B981
Warning:        #F59E0B
Danger:         #EF4444
```

### Dark Mode
```css
Background:     #0F172A
Foreground:     #F8FAFC
Card:           #1E293B
Border:         #334155
Muted:          #1E293B
Primary:        #60A5FA
Success:        #34D399
Warning:        #FBBF24
Danger:         #F87171
```

## 📱 Responsive Breakpoints

### Desktop (≥1024px)
- Sidebar: Always visible (256px)
- Table: All columns visible
- Stats: 4 columns

### Tablet (768px - 1023px)
- Sidebar: Collapsible
- Table: All columns visible
- Stats: 2 columns

### Mobile (<768px)
- Sidebar: Overlay/drawer
- Table: Horizontal scroll
- Stats: 1 column

## ✨ Animations & Transitions

### Hover Effects
```css
transition: all 0.2s ease-in-out;
```

### Modal Animations
- Fade in: 200ms
- Scale: 0.95 → 1.0
- Backdrop blur: 150ms

### Dropdown Menus
- Slide down: 150ms
- Fade in: 100ms

### Button Interactions
- Scale on click: 0.95
- Duration: 100ms

## 🔤 Typography

### Font Family
- Primary: System font stack
- Fallback: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif

### Font Sizes
- Page title: 30px (3xl)
- Section title: 20px (xl)
- Card title: 14px (sm)
- Stat value: 30px (3xl)
- Body text: 14px (sm)
- Small text: 12px (xs)

### Font Weights
- Bold: 700 (titles)
- Semibold: 600 (labels)
- Medium: 500 (body)
- Regular: 400 (secondary text)

## 🎯 Interactive States

### Buttons
- Default: Primary color
- Hover: Darker shade (10%)
- Active: Darker shade (20%)
- Disabled: 50% opacity

### Input Fields
- Default: Border color
- Focus: Primary color ring
- Error: Red border
- Disabled: Muted background

### Table Rows
- Default: Transparent
- Hover: Muted/50 background
- Selected: Muted background

## 📊 Data Visualization

### Trend Indicators
```
+12% ↗  (Green)
-5%  ↘  (Red)
```
- Arrow icon: 12px
- Percentage: 12px, font-medium
- Color matches trend direction

### Status Indicators
- Dot: 8px circle
- Colors match badge colors
- Positioned before text

## 🌐 Accessibility

### ARIA Labels
- All interactive elements have labels
- Form inputs have associated labels
- Buttons describe their action

### Keyboard Navigation
- Tab order follows visual flow
- Escape closes modals
- Enter submits forms
- Arrow keys navigate dropdowns

### Color Contrast
- Text: Minimum 4.5:1 ratio
- Large text: Minimum 3:1 ratio
- Interactive elements: Clear focus indicators

## 📏 Spacing System

Based on 4px base unit:

- xs: 4px
- sm: 8px
- md: 16px
- lg: 24px
- xl: 32px
- 2xl: 48px

### Component Spacing
- Card padding: 24px
- Section gap: 24px
- Element gap: 16px
- Button padding: 10px 16px

This design creates a professional, modern admin dashboard that's both functional and visually appealing!
