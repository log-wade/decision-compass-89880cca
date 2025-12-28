-- Create decision_links table for the Context Graph Layer
CREATE TABLE public.decision_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_decision_id UUID NOT NULL REFERENCES public.decision_records(id) ON DELETE CASCADE,
  to_decision_id UUID NOT NULL REFERENCES public.decision_records(id) ON DELETE CASCADE,
  relationship_type TEXT NOT NULL CHECK (relationship_type IN ('similar', 'supersedes', 'related')),
  confidence_score NUMERIC(3,2) CHECK (confidence_score IS NULL OR (confidence_score >= 0 AND confidence_score <= 1)),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  
  -- Prevent self-referencing links
  CONSTRAINT no_self_link CHECK (from_decision_id != to_decision_id),
  -- Prevent duplicate links of the same type
  CONSTRAINT unique_link UNIQUE (from_decision_id, to_decision_id, relationship_type)
);

-- Create indexes for efficient querying
CREATE INDEX idx_decision_links_from ON public.decision_links(from_decision_id);
CREATE INDEX idx_decision_links_to ON public.decision_links(to_decision_id);
CREATE INDEX idx_decision_links_type ON public.decision_links(relationship_type);

-- Enable RLS
ALTER TABLE public.decision_links ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view links for decisions they can access (any authenticated user per current decision_records RLS)
CREATE POLICY "Users can view decision links"
ON public.decision_links
FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Policy: Users can create links for their own decisions
CREATE POLICY "Users can create links for their decisions"
ON public.decision_links
FOR INSERT
WITH CHECK (
  auth.uid() IS NOT NULL AND
  EXISTS (
    SELECT 1 FROM public.decision_records 
    WHERE id = from_decision_id AND user_id = auth.uid()
  )
);

-- Policy: Users can delete links they created or for their decisions
CREATE POLICY "Users can delete their links"
ON public.decision_links
FOR DELETE
USING (
  created_by = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.decision_records 
    WHERE id = from_decision_id AND user_id = auth.uid()
  )
);

-- Policy: Admins can manage all links
CREATE POLICY "Admins can manage all links"
ON public.decision_links
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));