-- Change member_number column from integer to text to support year-based format (e.g., 2025-1001)
ALTER TABLE public.founding_members 
ALTER COLUMN member_number TYPE text USING member_number::text;

-- Also update profiles table founding_member_number column
ALTER TABLE public.profiles 
ALTER COLUMN founding_member_number TYPE text USING founding_member_number::text;