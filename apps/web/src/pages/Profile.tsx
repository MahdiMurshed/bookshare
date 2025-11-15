/**
 * Profile Page - User Profile Management
 *
 * Minimal monochrome aesthetic matching Home page design
 * Features: Profile card, edit mode, stats, account settings
 */

import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useUserProfile, useUserStats, useUpdateProfile, useUploadAvatar, useDeleteAccount } from '../hooks/useProfile';
import { Button } from '@repo/ui/components/button';
import { Card } from '@repo/ui/components/card';
import { Input } from '@repo/ui/components/input';
import { Label } from '@repo/ui/components/label';
import { Textarea } from '@repo/ui/components/textarea';
import { Avatar } from '@repo/ui/components/avatar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@repo/ui/components/dialog';
import {
  User,
  BookOpen,
  Heart,
  TrendingUp,
  Calendar,
  Mail,
  Edit2,
  Upload,
  Shield,
  LogOut,
  Trash2,
  Check,
  X,
  AlertTriangle,
} from 'lucide-react';

export default function Profile() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [editedBio, setEditedBio] = useState('');
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const { data: profile, isLoading: profileLoading } = useUserProfile(user?.id);
  const { data: stats, isLoading: statsLoading } = useUserStats(user?.id);
  const { mutateAsync: updateProfileMutation, isPending: isUpdating } = useUpdateProfile(user?.id);
  const { mutateAsync: uploadAvatarMutation, isPending: isUploading } = useUploadAvatar(user?.id);
  const { mutateAsync: deleteAccountMutation, isPending: isDeleting } = useDeleteAccount(user?.id);

  // Initialize edit form when entering edit mode
  const handleEditClick = () => {
    setEditedName(profile?.name || '');
    setEditedBio(profile?.bio || '');
    setIsEditing(true);
  };

  // Cancel edit mode
  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedName('');
    setEditedBio('');
  };

  // Save profile changes
  const handleSaveProfile = async () => {
    try {
      await updateProfileMutation({
        name: editedName,
        bio: editedBio,
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  // Handle avatar upload
  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Clear any previous errors
    setUploadError(null);

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setUploadError('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Image must be less than 5MB');
      return;
    }

    try {
      await uploadAvatarMutation(file);
      setUploadError(null);
    } catch (error) {
      console.error('Failed to upload avatar:', error);
      setUploadError('Failed to upload avatar. Please try again.');
    }
  };

  // Handle account deletion
  const handleDeleteAccount = async () => {
    setDeleteError(null);
    try {
      await deleteAccountMutation();
      navigate('/');
    } catch (error) {
      console.error('Failed to delete account:', error);
      setDeleteError('Failed to delete account. Please try again.');
    }
  };

  // Handle sign out
  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Failed to sign out:', error);
    }
  };

  const isLoading = profileLoading || statsLoading;

  // Get user initials for avatar fallback
  const userInitials = profile?.name
    ? profile.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : profile?.email?.[0].toUpperCase() || 'U';

  // Format member since date
  const memberSince = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : '';

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
            <Card className="border-2">
              <div className="p-8 space-y-8">
                {/* Avatar Section */}
                <div className="flex flex-col sm:flex-row items-start gap-6">
                  {/* Avatar */}
                  <div className="relative group">
                    <Avatar className="w-24 h-24 border-2 border-border">
                      {profile.avatar_url ? (
                        <img src={profile.avatar_url} alt={profile.name} className="object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-primary/10 text-2xl font-bold text-primary">
                          {userInitials}
                        </div>
                      )}
                    </Avatar>

                    {/* Upload Button Overlay */}
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                      className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer disabled:cursor-not-allowed"
                    >
                      <Upload className="w-6 h-6 text-white" />
                    </button>
                  </div>

                  {/* Hidden File Input */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                  />

                  {/* Upload Error Message */}
                  {uploadError && (
                    <div className="absolute -bottom-8 left-0 right-0 flex items-center gap-2 text-destructive text-sm">
                      <AlertTriangle className="w-4 h-4" />
                      <span>{uploadError}</span>
                    </div>
                  )}

                  {/* User Info */}
                  <div className="flex-1 space-y-4">
                    {!isEditing ? (
                      <>
                        <div className="space-y-2">
                          <h2 className="text-2xl font-bold">{profile.name}</h2>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Mail className="w-4 h-4" />
                            <span className="text-sm">{profile.email}</span>
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Calendar className="w-4 h-4" />
                            <span className="text-sm">Member since {memberSince}</span>
                          </div>
                        </div>

                        {profile.bio && (
                          <p className="text-muted-foreground leading-relaxed">{profile.bio}</p>
                        )}

                        <Button
                          onClick={handleEditClick}
                          variant="outline"
                          size="sm"
                          className="gap-2"
                        >
                          <Edit2 className="w-4 h-4" />
                          Edit Profile
                        </Button>
                      </>
                    ) : (
                      <div className="space-y-4">
                        {/* Edit Form */}
                        <div className="space-y-3">
                          <div className="space-y-2">
                            <Label htmlFor="name">Name</Label>
                            <Input
                              id="name"
                              value={editedName}
                              onChange={(e) => setEditedName(e.target.value)}
                              placeholder="Your name"
                              className="border-2"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="bio">Bio</Label>
                            <Textarea
                              id="bio"
                              value={editedBio}
                              onChange={(e) => setEditedBio(e.target.value)}
                              placeholder="Tell us about yourself..."
                              rows={4}
                              className="border-2 resize-none"
                            />
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3">
                          <Button
                            onClick={handleSaveProfile}
                            disabled={isUpdating}
                            size="sm"
                            className="gap-2"
                          >
                            <Check className="w-4 h-4" />
                            {isUpdating ? 'Saving...' : 'Save Changes'}
                          </Button>
                          <Button
                            onClick={handleCancelEdit}
                            disabled={isUpdating}
                            variant="outline"
                            size="sm"
                            className="gap-2"
                          >
                            <X className="w-4 h-4" />
                            Cancel
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Card>

            {/* Stats Section */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Your Activity</h3>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="border-2 hover:border-primary/50 transition-colors">
                  <div className="p-6 space-y-3">
                    <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
                      <BookOpen className="w-5 h-5 text-primary" />
                    </div>
                    <div className="space-y-1">
                      <div className="text-3xl font-bold">{stats?.booksOwned || 0}</div>
                      <div className="text-sm text-muted-foreground">Books Owned</div>
                    </div>
                  </div>
                </Card>

                <Card className="border-2 hover:border-primary/50 transition-colors">
                  <div className="p-6 space-y-3">
                    <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
                      <Heart className="w-5 h-5 text-primary" />
                    </div>
                    <div className="space-y-1">
                      <div className="text-3xl font-bold">{stats?.booksShared || 0}</div>
                      <div className="text-sm text-muted-foreground">Books Shared</div>
                    </div>
                  </div>
                </Card>

                <Card className="border-2 hover:border-primary/50 transition-colors">
                  <div className="p-6 space-y-3">
                    <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
                      <TrendingUp className="w-5 h-5 text-primary" />
                    </div>
                    <div className="space-y-1">
                      <div className="text-3xl font-bold">{stats?.booksBorrowed || 0}</div>
                      <div className="text-sm text-muted-foreground">Books Borrowed</div>
                    </div>
                  </div>
                </Card>

                <Card className="border-2 hover:border-primary/50 transition-colors">
                  <div className="p-6 space-y-3">
                    <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
                      <BookOpen className="w-5 h-5 text-primary" />
                    </div>
                    <div className="space-y-1">
                      <div className="text-3xl font-bold">{stats?.totalExchanges || 0}</div>
                      <div className="text-sm text-muted-foreground">Total Exchanges</div>
                    </div>
                  </div>
                </Card>
              </div>
            </div>

            {/* Account Settings Section */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Account Settings</h3>
              <Card className="border-2">
                <div className="divide-y divide-border">
                  {/* Change Password */}
                  <div className="p-6 flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-muted-foreground" />
                        <h4 className="font-medium">Password</h4>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Change your password to keep your account secure
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      Change Password
                    </Button>
                  </div>

                  {/* Sign Out */}
                  <div className="p-6 flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <LogOut className="w-4 h-4 text-muted-foreground" />
                        <h4 className="font-medium">Sign Out</h4>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Sign out of your account on this device
                      </p>
                    </div>
                    <Button onClick={handleSignOut} variant="outline" size="sm">
                      Sign Out
                    </Button>
                  </div>

                  {/* Delete Account */}
                  <div className="p-6 flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Trash2 className="w-4 h-4 text-destructive" />
                        <h4 className="font-medium text-destructive">Delete Account</h4>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Permanently delete your account and all associated data
                      </p>
                    </div>
                    <Button
                      onClick={() => setShowDeleteDialog(true)}
                      variant="outline"
                      size="sm"
                      className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                    >
                      Delete Account
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          </>
        )}
      </div>

      {/* Delete Account Confirmation Dialog */}
      <Dialog
        open={showDeleteDialog}
        onOpenChange={(open) => {
          setShowDeleteDialog(open);
          if (!open) setDeleteError(null);
        }}
      >
        <DialogContent className="border-2">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-destructive/10">
                <AlertTriangle className="w-6 h-6 text-destructive" />
              </div>
              <DialogTitle className="text-xl">Delete Account</DialogTitle>
            </div>
            <DialogDescription className="text-base leading-relaxed">
              Are you sure you want to delete your account? This action cannot be undone. All your
              books, borrow requests, and messages will be permanently deleted.
            </DialogDescription>
          </DialogHeader>

          {/* Delete Error Message */}
          {deleteError && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{deleteError}</span>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-2">
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteAccount}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete Account'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
