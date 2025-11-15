# Profile Page Setup

This document describes the Profile page implementation and setup requirements.

## Overview

The Profile page provides user profile management with a clean, monochrome design that matches the Home page aesthetic. It includes:

- **Profile Card**: Display and edit user information (name, email, bio)
- **Avatar Management**: Upload and change user avatar
- **Activity Stats**: View books owned, shared, borrowed, and total exchanges
- **Account Settings**: Change password, sign out, delete account

## Features

### Profile Management
- Edit name and bio
- Upload avatar (with hover overlay for easy access)
- View member since date
- Display email (read-only)

### Statistics
- Books Owned
- Books Shared (borrowable books)
- Books Borrowed (currently borrowed)
- Total Exchanges (completed borrow requests)

### Account Settings
- Change Password (placeholder - needs implementation)
- Sign Out
- Delete Account (with confirmation dialog)

## Supabase Setup Required

### 1. Create Avatars Storage Bucket

You need to create a storage bucket for user avatars:

1. Go to Supabase Dashboard → Storage
2. Click "New bucket"
3. Bucket name: `avatars`
4. Make it **public** (so avatars can be displayed)
5. Click "Create bucket"

### 2. Set Storage Policies

Add the following policies to the `avatars` bucket:

**Allow authenticated users to upload:**
```sql
CREATE POLICY "Authenticated users can upload avatars"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'avatars');
```

**Allow public read access:**
```sql
CREATE POLICY "Public can view avatars"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');
```

**Allow users to update their own avatars:**
```sql
CREATE POLICY "Users can update own avatars"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
```

## Files Created

### API Client
- `/packages/api-client/src/users.ts` - User profile management functions
- Updated `/packages/api-client/src/index.ts` - Export user functions

### Hooks
- `/apps/web/src/hooks/useProfile.ts` - React hooks for profile management

### Components

#### Page (Orchestration)
- `/apps/web/src/pages/Profile.tsx` - Profile page component (107 lines)
  - Handles data fetching and state management
  - Orchestrates child components
  - Manages navigation and routing

#### Feature Components
- `/apps/web/src/components/Profile/ProfileHeader.tsx` (~250 lines)
  - Avatar upload with file validation (type, size limits)
  - User info display (name, email, bio)
  - Inline editing mode for name and bio
  - Error handling for upload failures

- `/apps/web/src/components/Profile/ProfileStats.tsx` (~80 lines)
  - Activity statistics display
  - Books owned, shared, borrowed counts
  - Total exchanges metric
  - Responsive grid layout

- `/apps/web/src/components/Profile/ProfileSettings.tsx` (~165 lines)
  - Account settings section
  - Sign out functionality
  - Delete account with confirmation dialog
  - Inline error display for delete failures

### Routes
- Updated `/apps/web/src/App.tsx` - Added `/profile` route
- Updated `/apps/web/src/components/Header.tsx` - Added profile links

## API Functions

### `getUserProfile(userId: string)`
Fetch user profile by ID

### `updateProfile(userId: string, input: UpdateProfileInput)`
Update user name and bio

### `uploadAvatar(userId: string, file: File)`
Upload user avatar to Supabase Storage

### `deleteAccount(userId: string)`
Delete user account (currently just signs out)

### `getUserStats(userId: string)`
Get user activity statistics

## React Hooks

### `useUserProfile(userId)`
Fetch user profile data

### `useUserStats(userId)`
Fetch user activity statistics

### `useUpdateProfile(userId)`
Mutation hook for updating profile

### `useUploadAvatar(userId)`
Mutation hook for uploading avatar

### `useDeleteAccount(userId)`
Mutation hook for deleting account

## Design Principles

The Profile page follows the Home page's monochrome aesthetic:

- **Colors**: Minimal color usage, `bg-background`, `text-foreground`, `text-muted-foreground`
- **Borders**: Clean `border-2` with `border-border`
- **Icons**: Primary color accents (`text-primary`)
- **Layout**: Clean, professional SaaS design
- **Hover States**: Subtle transitions and hover effects
- **No Gradients**: Except very subtle background patterns

## Future Enhancements

1. **Change Password**: Implement password change functionality
2. **Delete Account**: Proper account deletion with data cleanup
3. **Profile Privacy**: Add privacy settings
4. **Social Links**: Add social media links
5. **Reading Preferences**: Add genre preferences
6. **Location**: Add location for local book sharing
7. **Avatar Crop**: Add image cropping before upload
8. **Profile Completion**: Show profile completion percentage

## Testing

To test the Profile page:

1. Ensure you're signed in
2. Navigate to `/profile` or click "Profile" in the user menu
3. Test editing name and bio
4. Test uploading an avatar (requires Supabase storage bucket)
5. View your activity stats
6. Test account settings options

## Component Architecture

### Refactoring Benefits

The Profile page was refactored from a monolithic 495-line component into a modular structure:

**Before:**
- Single file with 495 lines
- All logic, state, and UI mixed together
- Difficult to test and maintain

**After:**
- Main page: 107 lines (78% reduction)
- Three focused feature components
- Clear separation of concerns

### Component Responsibilities

1. **Profile.tsx (Page)**
   - Data fetching with React Query hooks
   - State orchestration
   - Navigation and routing
   - Passing props to child components

2. **ProfileHeader.tsx (Feature)**
   - Avatar management (upload, display, validation)
   - User information display
   - Inline editing functionality
   - Local state for edit mode and errors

3. **ProfileStats.tsx (Feature)**
   - Statistics display only
   - No local state (receives data via props)
   - Purely presentational

4. **ProfileSettings.tsx (Feature)**
   - Account settings UI
   - Sign out functionality
   - Delete account with confirmation
   - Local state for dialog and errors

### Benefits

✅ **Testability**: Each component can be tested independently
✅ **Reusability**: Components can be used in different contexts
✅ **Maintainability**: Smaller files are easier to understand and modify
✅ **Performance**: Better code splitting opportunities
✅ **Developer Experience**: Easier to navigate and locate code

## Notes

- Avatar uploads are limited to 5MB
- Only image files are accepted for avatars
- The delete account function currently only signs the user out
- Profile changes immediately invalidate React Query cache
- Member since date is formatted as "Month Year"
- Component extraction follows best practices outlined in CODE_QUALITY_IMPROVEMENTS.md
