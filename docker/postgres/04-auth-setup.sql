# CREATE OR REPLACE FUNCTION public.handle_new_user()
# RETURNS TRIGGER AS $$
# BEGIN
#   INSERT INTO public.user_profiles (id, username, avatar_url)
#   VALUES (
#     NEW.id,
#     COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
#     COALESCE(NEW.raw_user_meta_data->>'avatar_url', '/images/default-avatar.png')
#   );
#   RETURN NEW;
# END;
# $$ LANGUAGE plpgsql SECURITY DEFINER;

# DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
# CREATE TRIGGER on_auth_user_created
#   AFTER INSERT ON auth.users
#   FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();