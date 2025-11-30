-- Allow Admins to update any profile (for approval)
create policy "Admins can update any profile"
  on profiles for update
  using (
    exists (
      select 1 from profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Allow Admins to view all profiles (already covered by public view, but good to be explicit if we lock it down later)
-- For now, the "Public profiles are viewable by everyone" policy covers this.
