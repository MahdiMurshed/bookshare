-- Migration 015: Add Location to Communities
-- Adds location field to communities table for location-based discovery

-- Add location column to communities table
ALTER TABLE public.communities
ADD COLUMN IF NOT EXISTS location TEXT;

-- Create index for location searches
CREATE INDEX IF NOT EXISTS communities_location_idx
ON public.communities(location)
WHERE location IS NOT NULL;

-- Update the existing full-text search index to include location
DROP INDEX IF EXISTS communities_name_search_idx;
CREATE INDEX communities_name_search_idx
ON public.communities
USING gin(to_tsvector('english', name || ' ' || COALESCE(description, '') || ' ' || COALESCE(location, '')));
