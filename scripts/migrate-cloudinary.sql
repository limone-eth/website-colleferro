-- Add image URL columns for Cloudinary-hosted media.
-- Player portraits on squad.photo_url, sponsor logos on sponsors.logo_url.
ALTER TABLE squad ADD COLUMN photo_url TEXT;
ALTER TABLE sponsors ADD COLUMN logo_url TEXT;
