-- Seed data for RT Tukar application
-- Run this after the main schema setup

-- Insert sample RTs
INSERT INTO rts (id, name, kelurahan, kecamatan) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'RT 001/RW 005', 'Menteng', 'Menteng'),
  ('550e8400-e29b-41d4-a716-446655440002', 'RT 002/RW 003', 'Kemang', 'Mampang Prapatan'),
  ('550e8400-e29b-41d4-a716-446655440003', 'RT 003/RW 001', 'Pondok Indah', 'Kebayoran Lama');

-- Note: You'll need to create users through the auth signup flow first
-- Then manually insert their profiles and memberships

-- Example profiles (replace UUIDs with actual auth user IDs after signup)
-- INSERT INTO profiles (id, name, phone) VALUES
--   ('user-uuid-1', 'Budi Santoso', '08123456789'),
--   ('user-uuid-2', 'Sari Dewi', '08129876543'),
--   ('user-uuid-3', 'Ahmad Rahman', '08134567890');

-- Example memberships (link users to RTs)
-- INSERT INTO members (profile_id, rt_id, role) VALUES
--   ('user-uuid-1', '550e8400-e29b-41d4-a716-446655440001', 'admin'),
--   ('user-uuid-2', '550e8400-e29b-41d4-a716-446655440001', 'member'),
--   ('user-uuid-3', '550e8400-e29b-41d4-a716-446655440001', 'member');

-- Example items (add after users are created)
-- INSERT INTO items (title, description, category, quantity, unit, condition, donor_id, rt_id, status) VALUES
--   ('Fresh Vegetables', 'Homegrown vegetables from my garden - tomatoes, lettuce, and carrots', 'Food', 3, 'kg', 'new', 'user-uuid-1', '550e8400-e29b-41d4-a716-446655440001', 'available'),
--   ('Rice Cooker', 'Barely used rice cooker, still in great condition', 'Household Items', 1, 'piece', 'like_new', 'user-uuid-2', '550e8400-e29b-41d4-a716-446655440001', 'available'),
--   ('Children Books', 'Collection of Indonesian children storybooks', 'Books', 5, 'books', 'good', 'user-uuid-3', '550e8400-e29b-41d4-a716-446655440001', 'available');