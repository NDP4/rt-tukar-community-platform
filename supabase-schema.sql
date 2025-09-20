-- RT Community Exchange System Database Schema
-- Execute this in Supabase SQL Editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create RTs table
CREATE TABLE rts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  kelurahan TEXT NOT NULL,
  kecamatan TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create profiles table (extends auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create members table (links users to RTs with roles)
CREATE TABLE members (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  rt_id UUID REFERENCES rts(id) ON DELETE CASCADE NOT NULL,
  role TEXT CHECK (role IN ('admin', 'member')) DEFAULT 'member' NOT NULL,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(profile_id) -- Each user can only be in one RT
);

-- Create items table
CREATE TABLE items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit TEXT NOT NULL DEFAULT 'piece',
  condition TEXT CHECK (condition IN ('new', 'like_new', 'good', 'fair')) DEFAULT 'good',
  photo_path TEXT,
  donor_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  rt_id UUID REFERENCES rts(id) ON DELETE CASCADE NOT NULL,
  status TEXT CHECK (status IN ('available', 'requested', 'reserved', 'collected')) DEFAULT 'available',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create requests table
CREATE TABLE requests (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  item_id UUID REFERENCES items(id) ON DELETE CASCADE NOT NULL,
  requester_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  status TEXT CHECK (status IN ('pending', 'accepted', 'rejected', 'collected')) DEFAULT 'pending',
  message TEXT,
  scheduled_pickup_date TIMESTAMP WITH TIME ZONE,
  pickup_address TEXT,
  pickup_code UUID,
  pickup_code_used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create comments table
CREATE TABLE comments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  item_id UUID REFERENCES items(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  body TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE rts ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles (drop if exists first)
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for members
CREATE POLICY "Users can view members in their RT" ON members
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM members m2 
      WHERE m2.profile_id = auth.uid() 
      AND m2.rt_id = members.rt_id
    )
  );

CREATE POLICY "RT admins can manage members" ON members
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM members m2 
      WHERE m2.profile_id = auth.uid() 
      AND m2.rt_id = members.rt_id 
      AND m2.role = 'admin'
    )
  );

CREATE POLICY "Users can join an RT" ON members
  FOR INSERT WITH CHECK (profile_id = auth.uid());

-- RLS Policies for RTs
CREATE POLICY "Users can view their RT" ON rts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM members 
      WHERE members.profile_id = auth.uid() 
      AND members.rt_id = rts.id
    )
  );

-- RLS Policies for items
CREATE POLICY "Users can view items in their RT" ON items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM members 
      WHERE members.profile_id = auth.uid() 
      AND members.rt_id = items.rt_id
    )
  );

CREATE POLICY "Users can create items in their RT" ON items
  FOR INSERT WITH CHECK (
    donor_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM members 
      WHERE members.profile_id = auth.uid() 
      AND members.rt_id = items.rt_id
    )
  );

CREATE POLICY "Donors and RT admins can update items" ON items
  FOR UPDATE USING (
    donor_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM members 
      WHERE members.profile_id = auth.uid() 
      AND members.rt_id = items.rt_id 
      AND members.role = 'admin'
    )
  );

CREATE POLICY "Donors and RT admins can delete items" ON items
  FOR DELETE USING (
    donor_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM members 
      WHERE members.profile_id = auth.uid() 
      AND members.rt_id = items.rt_id 
      AND members.role = 'admin'
    )
  );

-- RLS Policies for requests
CREATE POLICY "Users can view requests for items in their RT" ON requests
  FOR SELECT USING (
    requester_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM items 
      WHERE items.id = requests.item_id 
      AND items.donor_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM items 
      JOIN members ON members.rt_id = items.rt_id 
      WHERE items.id = requests.item_id 
      AND members.profile_id = auth.uid() 
      AND members.role = 'admin'
    )
  );

CREATE POLICY "Users can create requests for items in their RT" ON requests
  FOR INSERT WITH CHECK (
    requester_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM items 
      JOIN members ON members.rt_id = items.rt_id 
      WHERE items.id = requests.item_id 
      AND members.profile_id = auth.uid()
    )
  );

CREATE POLICY "Requesters, donors, and RT admins can update requests" ON requests
  FOR UPDATE USING (
    requester_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM items 
      WHERE items.id = requests.item_id 
      AND items.donor_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM items 
      JOIN members ON members.rt_id = items.rt_id 
      WHERE items.id = requests.item_id 
      AND members.profile_id = auth.uid() 
      AND members.role = 'admin'
    )
  );

-- RLS Policies for comments
CREATE POLICY "Users can view comments on items in their RT" ON comments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM items 
      JOIN members ON members.rt_id = items.rt_id 
      WHERE items.id = comments.item_id 
      AND members.profile_id = auth.uid()
    )
  );

CREATE POLICY "Users can create comments on items in their RT" ON comments
  FOR INSERT WITH CHECK (
    user_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM items 
      JOIN members ON members.rt_id = items.rt_id 
      WHERE items.id = comments.item_id 
      AND members.profile_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own comments" ON comments
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete own comments or RT admins can delete any" ON comments
  FOR DELETE USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM items 
      JOIN members ON members.rt_id = items.rt_id 
      WHERE items.id = comments.item_id 
      AND members.profile_id = auth.uid() 
      AND members.role = 'admin'
    )
  );

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_rts_updated_at BEFORE UPDATE ON rts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_items_updated_at BEFORE UPDATE ON items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_requests_updated_at BEFORE UPDATE ON requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON comments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, phone)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', NEW.email), NEW.raw_user_meta_data->>'phone');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup (drop if exists first)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create storage bucket for item photos (only if not exists)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('items', 'items', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies (drop if exists first)
DROP POLICY IF EXISTS "Anyone can view item photos" ON storage.objects;
CREATE POLICY "Anyone can view item photos" ON storage.objects
  FOR SELECT USING (bucket_id = 'items');

DROP POLICY IF EXISTS "Authenticated users can upload item photos" ON storage.objects;
CREATE POLICY "Authenticated users can upload item photos" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'items' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can update own photos" ON storage.objects;
CREATE POLICY "Users can update own photos" ON storage.objects
  FOR UPDATE USING (bucket_id = 'items' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "Users can delete own photos" ON storage.objects;
CREATE POLICY "Users can delete own photos" ON storage.objects
  FOR DELETE USING (bucket_id = 'items' AND auth.uid()::text = (storage.foldername(name))[1]);