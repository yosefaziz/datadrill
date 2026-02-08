-- Update existing rows first
UPDATE public.profiles SET weakest_skill = 'python' WHERE weakest_skill = 'pyspark';
UPDATE public.submissions SET skill = 'python' WHERE skill = 'pyspark';

-- Drop and recreate CHECK constraint
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_weakest_skill_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_weakest_skill_check
  CHECK (weakest_skill IN ('sql', 'python', 'architecture', 'modeling'));
