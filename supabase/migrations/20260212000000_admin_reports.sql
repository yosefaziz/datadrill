-- Add is_admin column to profiles
ALTER TABLE profiles ADD COLUMN is_admin boolean NOT NULL DEFAULT false;

-- Allow admins to read all question reports
CREATE POLICY "Admins can view all reports"
  ON question_reports
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.is_admin = true
    )
  );
