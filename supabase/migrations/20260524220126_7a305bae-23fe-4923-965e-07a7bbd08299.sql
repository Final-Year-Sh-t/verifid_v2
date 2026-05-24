
-- 1. user_roles: add restrictive INSERT policy (only super_admins can insert)
CREATE POLICY "Only super admins can insert roles"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (public.is_super_admin(auth.uid()));

-- 2. institutions: replace permissive INSERT policy
DROP POLICY IF EXISTS "Authenticated users can create institutions" ON public.institutions;
CREATE POLICY "Only super admins can create institutions"
ON public.institutions
FOR INSERT
TO authenticated
WITH CHECK (public.is_super_admin(auth.uid()));

-- 3. institutions: remove broad public read
DROP POLICY IF EXISTS "Public can view institutions for login" ON public.institutions;
CREATE POLICY "Authenticated users can view institutions"
ON public.institutions
FOR SELECT
TO authenticated
USING (true);

-- 4. Storage: tighten institution-logos modify policies (path = {institution_id}/...)
DROP POLICY IF EXISTS "Institution admins can upload logos" ON storage.objects;
DROP POLICY IF EXISTS "Institution admins can update logos" ON storage.objects;
DROP POLICY IF EXISTS "Institution admins can delete logos" ON storage.objects;

CREATE POLICY "Institution admins can upload logos"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'institution-logos'
  AND (
    public.is_super_admin(auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid()
        AND ur.role = 'admin'::app_role
        AND ur.institution_id::text = (storage.foldername(name))[1]
    )
  )
);

CREATE POLICY "Institution admins can update logos"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'institution-logos'
  AND (
    public.is_super_admin(auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid()
        AND ur.role = 'admin'::app_role
        AND ur.institution_id::text = (storage.foldername(name))[1]
    )
  )
);

CREATE POLICY "Institution admins can delete logos"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'institution-logos'
  AND (
    public.is_super_admin(auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid()
        AND ur.role = 'admin'::app_role
        AND ur.institution_id::text = (storage.foldername(name))[1]
    )
  )
);

-- 5. Revoke EXECUTE from anon on sensitive SECURITY DEFINER functions
REVOKE EXECUTE ON FUNCTION public.create_institution_for_current_user(text) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.join_institution_for_current_user(uuid) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.switch_active_institution(uuid) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.is_super_admin(uuid) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.get_user_institution(uuid) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.get_user_institutions(uuid) FROM anon, public;

GRANT EXECUTE ON FUNCTION public.create_institution_for_current_user(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.join_institution_for_current_user(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.switch_active_institution(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_super_admin(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_institution(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_institutions(uuid) TO authenticated;
