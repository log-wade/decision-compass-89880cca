-- Phase 1: Critical Security Fixes for RLS Policies

-- 1. Fix decision_records SELECT policy - users should only see their own decisions
DROP POLICY IF EXISTS "Users can view their organization's decisions" ON public.decision_records;

CREATE POLICY "Users can view their own decisions"
ON public.decision_records
FOR SELECT
USING (auth.uid() = user_id);

-- 2. Fix decision_links SELECT policy - users should only see links where they own at least one connected decision
DROP POLICY IF EXISTS "Users can view decision links" ON public.decision_links;

CREATE POLICY "Users can view links for their decisions"
ON public.decision_links
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.decision_records
    WHERE (decision_records.id = decision_links.from_decision_id OR decision_records.id = decision_links.to_decision_id)
    AND decision_records.user_id = auth.uid()
  )
);

-- 3. Add missing UPDATE policy for decision_links
CREATE POLICY "Users can update their links"
ON public.decision_links
FOR UPDATE
USING (
  created_by = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.decision_records
    WHERE decision_records.id = decision_links.from_decision_id
    AND decision_records.user_id = auth.uid()
  )
);