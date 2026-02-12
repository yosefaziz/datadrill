-- Add status column to question_reports for report lifecycle management

ALTER TABLE public.question_reports
  ADD COLUMN status text NOT NULL DEFAULT 'new'
  CHECK (status IN ('new', 'reviewing', 'resolved', 'dismissed'));

-- Allow admins to update question reports (status changes)
CREATE POLICY "Admins can update reports"
  ON public.question_reports
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.is_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.is_admin = true
    )
  );
