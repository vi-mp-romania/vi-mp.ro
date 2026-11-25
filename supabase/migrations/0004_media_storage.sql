-- Media uploads: a public Storage bucket for images uploaded from the control panel (hero image,
-- news thumbnails). Anyone can view the files through their public URL; only admins may upload,
-- replace or delete them. The panel resizes images in the browser before uploading.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('media', 'media', true, 3145728, array['image/webp', 'image/jpeg', 'image/png']);

create policy "admins read media" on storage.objects
  for select to authenticated using (bucket_id = 'media' and public.is_admin());
create policy "admins upload media" on storage.objects
  for insert to authenticated with check (bucket_id = 'media' and public.is_admin());
create policy "admins update media" on storage.objects
  for update to authenticated using (bucket_id = 'media' and public.is_admin())
  with check (bucket_id = 'media' and public.is_admin());
create policy "admins delete media" on storage.objects
  for delete to authenticated using (bucket_id = 'media' and public.is_admin());
