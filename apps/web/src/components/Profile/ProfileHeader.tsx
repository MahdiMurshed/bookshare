/**
 * ProfileHeader Component
 *
 * Displays user avatar, basic info, and edit profile form
 * Handles avatar upload with validation
 */

import { useState, useRef } from 'react';
import type { User } from '@repo/api-client';
import { Button } from '@repo/ui/components/button';
import { Card } from '@repo/ui/components/card';
import { Input } from '@repo/ui/components/input';
import { Label } from '@repo/ui/components/label';
import { Textarea } from '@repo/ui/components/textarea';
import { Avatar } from '@repo/ui/components/avatar';
import {
  Calendar,
  Mail,
  Edit2,
  Upload,
  Check,
  X,
  AlertTriangle,
} from 'lucide-react';
import { logError } from '../../lib/utils/errors';

interface ProfileHeaderProps {
  profile: User;
  isUploading: boolean;
  isUpdating: boolean;
  onAvatarUpload: (file: File) => Promise<void>;
  onUpdateProfile: (data: { name: string; bio: string }) => Promise<void>;
}

export function ProfileHeader({
  profile,
  isUploading,
  isUpdating,
  onAvatarUpload,
  onUpdateProfile,
}: ProfileHeaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [editedBio, setEditedBio] = useState('');
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Get user initials for avatar fallback
  const userInitials = profile.name
    ? profile.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : profile.email?.[0].toUpperCase() || 'U';

  // Format member since date
  const memberSince = profile.created_at
    ? new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : '';

  const handleEditClick = () => {
    setEditedName(profile.name || '');
    setEditedBio(profile.bio || '');
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedName('');
    setEditedBio('');
  };

  const handleSaveProfile = async () => {
    try {
      await onUpdateProfile({
        name: editedName,
        bio: editedBio,
      });
      setIsEditing(false);
    } catch (error) {
      logError(error, 'updating profile');
    }
  };

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
      await onAvatarUpload(file);
      setUploadError(null);
    } catch (error) {
      logError(error, 'uploading avatar');
      setUploadError('Failed to upload avatar. Please try again.');
    }
  };

  return (
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
  );
}
