/**
 * Profile Page - User Profile Management
 *
 * Minimal monochrome aesthetic matching Home page design
 * Features: Profile card, edit mode, stats, account settings
 *
 * Refactored into smaller components for better maintainability
 */

import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useUserProfile, useUserStats, useUpdateProfile, useUploadAvatar, useDeleteAccount } from '../hooks/useProfile';
import { User } from 'lucide-react';
import { ProfileHeader } from '../components/Profile/ProfileHeader';
import { ProfileStats } from '../components/Profile/ProfileStats';
import { ProfileSettings } from '../components/Profile/ProfileSettings';

export default function Profile() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const { data: profile, isLoading: profileLoading } = useUserProfile(user?.id);
  const { data: stats, isLoading: statsLoading } = useUserStats(user?.id);
  const { mutateAsync: updateProfileMutation, isPending: isUpdating } = useUpdateProfile(user?.id);
  const { mutateAsync: uploadAvatarMutation, isPending: isUploading } = useUploadAvatar(user?.id);
  const { mutateAsync: deleteAccountMutation, isPending: isDeleting } = useDeleteAccount(user?.id);

  const isLoading = profileLoading || statsLoading;

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const handleDeleteAccount = async () => {
    await deleteAccountMutation();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative border-b border-border">
        {/* Subtle Background Pattern */}
        <div className="absolute inset-0 opacity-[0.015] dark:opacity-[0.03]">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `repeating-linear-gradient(0deg, currentColor 0px, currentColor 1px, transparent 1px, transparent 40px),
                               repeating-linear-gradient(90deg, currentColor 0px, currentColor 1px, transparent 1px, transparent 40px)`,
            }}
          />
        </div>

        <div className="relative max-w-5xl mx-auto px-6 py-12 md:py-16">
          <div className="max-w-3xl mx-auto text-center space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-primary/10 mb-2">
              <User className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Profile</h1>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              Manage your account settings and view your BookShare activity
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-6 py-8 md:py-12 space-y-8">
        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center gap-3 text-muted-foreground">
              <div className="h-4 w-4 rounded-full bg-primary animate-pulse" />
              <span>Loading profile...</span>
            </div>
          </div>
        )}

        {/* Profile Content */}
        {!isLoading && profile && (
          <>
            {/* Profile Card */}
            <ProfileHeader
              profile={profile}
              isUploading={isUploading}
              isUpdating={isUpdating}
              onAvatarUpload={uploadAvatarMutation}
              onUpdateProfile={updateProfileMutation}
            />

            {/* Stats Section */}
            <ProfileStats stats={stats} />

            {/* Account Settings Section */}
            <ProfileSettings
              isDeleting={isDeleting}
              onSignOut={handleSignOut}
              onDeleteAccount={handleDeleteAccount}
            />
          </>
        )}
      </div>
    </div>
  );
}
