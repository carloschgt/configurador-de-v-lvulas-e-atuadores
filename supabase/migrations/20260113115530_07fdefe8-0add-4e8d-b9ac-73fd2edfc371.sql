-- Allow authenticated users to insert health logs
CREATE POLICY "Authenticated users can insert health logs"
ON public.system_health_log
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Allow authenticated users to insert decision logs for their own specs
-- (Policy already exists but let's make sure it's permissive)
DROP POLICY IF EXISTS "Users can insert logs for own specs" ON public.norm_decision_log;
CREATE POLICY "Users can insert decision logs"
ON public.norm_decision_log
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());