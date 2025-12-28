import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export type RelationshipType = 'similar' | 'supersedes' | 'related';

export interface DecisionLink {
  id: string;
  from_decision_id: string;
  to_decision_id: string;
  relationship_type: RelationshipType;
  confidence_score: number | null;
  created_at: string;
  created_by: string | null;
}

export interface LinkedDecision {
  id: string;
  title: string;
  summary: string | null;
  relationship_type: RelationshipType;
  link_id: string;
  direction: 'from' | 'to';
}

const RELATIONSHIP_LABELS: Record<RelationshipType, string> = {
  similar: 'Similar decision',
  supersedes: 'Supersedes',
  related: 'Related decision',
};

export function getRelationshipLabel(type: RelationshipType): string {
  return RELATIONSHIP_LABELS[type] || type;
}

/**
 * Hook to fetch linked/related decisions for a given decision
 * Queries both directions: decisions that link TO this one and decisions this one links FROM
 */
export function useDecisionLinks(decisionId: string | undefined) {
  const { user } = useAuth();

  const { data: linkedDecisions, isLoading, error } = useQuery({
    queryKey: ['decision-links', decisionId],
    queryFn: async (): Promise<LinkedDecision[]> => {
      if (!decisionId) return [];

      // Get links where this decision is the "from" side
      const { data: fromLinks, error: fromError } = await supabase
        .from('decision_links')
        .select(`
          id,
          to_decision_id,
          relationship_type,
          decision_records!decision_links_to_decision_id_fkey (
            id,
            title,
            summary
          )
        `)
        .eq('from_decision_id', decisionId);

      if (fromError) throw fromError;

      // Get links where this decision is the "to" side
      const { data: toLinks, error: toError } = await supabase
        .from('decision_links')
        .select(`
          id,
          from_decision_id,
          relationship_type,
          decision_records!decision_links_from_decision_id_fkey (
            id,
            title,
            summary
          )
        `)
        .eq('to_decision_id', decisionId);

      if (toError) throw toError;

      // Combine and format results
      const linked: LinkedDecision[] = [];

      fromLinks?.forEach((link) => {
        const record = link.decision_records as unknown as { id: string; title: string; summary: string | null } | null;
        if (record) {
          linked.push({
            id: record.id,
            title: record.title,
            summary: record.summary,
            relationship_type: link.relationship_type as RelationshipType,
            link_id: link.id,
            direction: 'from',
          });
        }
      });

      toLinks?.forEach((link) => {
        const record = link.decision_records as unknown as { id: string; title: string; summary: string | null } | null;
        if (record) {
          linked.push({
            id: record.id,
            title: record.title,
            summary: record.summary,
            relationship_type: link.relationship_type as RelationshipType,
            link_id: link.id,
            direction: 'to',
          });
        }
      });

      // Deduplicate by decision ID (in case of multiple link types)
      const seen = new Set<string>();
      return linked.filter((item) => {
        if (seen.has(item.id)) return false;
        seen.add(item.id);
        return true;
      }).slice(0, 5); // Limit to 5 as per spec
    },
    enabled: !!user && !!decisionId,
  });

  return {
    linkedDecisions: linkedDecisions || [],
    isLoading,
    error,
  };
}

/**
 * Hook to manage decision links (create/delete)
 */
export function useManageDecisionLinks() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const createLink = useMutation({
    mutationFn: async ({
      fromDecisionId,
      toDecisionId,
      relationshipType,
      confidenceScore,
    }: {
      fromDecisionId: string;
      toDecisionId: string;
      relationshipType: RelationshipType;
      confidenceScore?: number;
    }) => {
      const { data, error } = await supabase
        .from('decision_links')
        .insert({
          from_decision_id: fromDecisionId,
          to_decision_id: toDecisionId,
          relationship_type: relationshipType,
          confidence_score: confidenceScore || null,
          created_by: user?.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['decision-links', variables.fromDecisionId] });
      queryClient.invalidateQueries({ queryKey: ['decision-links', variables.toDecisionId] });
      toast.success('Decision linked successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to link decisions: ${error.message}`);
    },
  });

  const deleteLink = useMutation({
    mutationFn: async ({ linkId, decisionId }: { linkId: string; decisionId: string }) => {
      const { error } = await supabase
        .from('decision_links')
        .delete()
        .eq('id', linkId);

      if (error) throw error;
      return decisionId;
    },
    onSuccess: (decisionId) => {
      queryClient.invalidateQueries({ queryKey: ['decision-links', decisionId] });
      toast.success('Link removed');
    },
    onError: (error: Error) => {
      toast.error(`Failed to remove link: ${error.message}`);
    },
  });

  return {
    createLink,
    deleteLink,
  };
}
