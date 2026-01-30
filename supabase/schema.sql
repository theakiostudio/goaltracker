-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  initials TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Goals table
CREATE TABLE IF NOT EXISTS public.goals (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'done')),
  start_date DATE NOT NULL,
  due_date DATE NOT NULL,
  accountability_partner TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Milestones/Steps table
CREATE TABLE IF NOT EXISTS public.milestones (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  goal_id UUID REFERENCES public.goals(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  completed BOOLEAN DEFAULT FALSE NOT NULL,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Vision board images table
CREATE TABLE IF NOT EXISTS public.vision_board_images (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  image_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vision_board_images ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Goals policies
CREATE POLICY "Users can view own goals" ON public.goals
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own goals" ON public.goals
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own goals" ON public.goals
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own goals" ON public.goals
  FOR DELETE USING (auth.uid() = user_id);

-- Milestones policies
CREATE POLICY "Users can view own milestones" ON public.milestones
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.goals
      WHERE goals.id = milestones.goal_id
      AND goals.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own milestones" ON public.milestones
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.goals
      WHERE goals.id = milestones.goal_id
      AND goals.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own milestones" ON public.milestones
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.goals
      WHERE goals.id = milestones.goal_id
      AND goals.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own milestones" ON public.milestones
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.goals
      WHERE goals.id = milestones.goal_id
      AND goals.user_id = auth.uid()
    )
  );

-- Vision board images policies
CREATE POLICY "Users can view own vision board images" ON public.vision_board_images
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own vision board images" ON public.vision_board_images
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own vision board images" ON public.vision_board_images
  FOR DELETE USING (auth.uid() = user_id);

-- Function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, initials)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    UPPER(LEFT(COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email), 2))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
