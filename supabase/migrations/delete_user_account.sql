-- Function to allow users to delete their own account
-- Called via supabase.rpc('delete_user_account')
CREATE OR REPLACE FUNCTION public.delete_user_account()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Delete submissions
  DELETE FROM public.submissions WHERE user_id = auth.uid();
  -- Delete profile
  DELETE FROM public.profiles WHERE id = auth.uid();
  -- Delete auth user
  DELETE FROM auth.users WHERE id = auth.uid();
END;
$$;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION public.delete_user_account() TO authenticated;
