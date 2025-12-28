import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Database } from '@/integrations/supabase/types';
import { DECISION_TYPE_LABEL } from '@/lib/sales-config';

type DecisionRecord = Database['public']['Tables']['decision_records']['Row'];
type DecisionInsert = Database['public']['Tables']['decision_records']['Insert'];
type DecisionUpdate = Database['public']['Tables']['decision_records']['Update'];

export interface DecisionFormData {
  title: string;
  summary: string;
  context_tags: string[];
  constraints: string;
  options_considered: { label: string; description: string }[];
  selected_option: string;
  reasoning: string;
  risks_assumptions: string;
  confidence_level: '1' | '2' | '3' | '4' | '5';
  estimated_impact_value: number | null;
  estimated_impact_label: string;
  outcome: string;
  is_draft: boolean;
}

export function useDecisions() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const decisionsQuery = useQuery({
    queryKey: ['decisions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('decision_records')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as DecisionRecord[];
    },
    enabled: !!user,
  });

  const createDecision = useMutation({
    mutationFn: async (data: DecisionFormData) => {
      if (!user) throw new Error('Not authenticated');
      
      const insertData: DecisionInsert = {
        user_id: user.id,
        title: data.title,
        summary: data.summary || null,
        context_tags: data.context_tags,
        constraints: data.constraints || null,
        options_considered: data.options_considered,
        selected_option: data.selected_option || null,
        reasoning: data.reasoning || null,
        risks_assumptions: data.risks_assumptions || null,
        confidence_level: data.confidence_level,
        estimated_impact_value: data.estimated_impact_value,
        estimated_impact_label: data.estimated_impact_label || null,
        outcome: data.outcome || null,
        is_draft: data.is_draft,
        decision_owner: user.id,
      };
      
      const { data: result, error } = await supabase
        .from('decision_records')
        .insert(insertData)
        .select()
        .single();
      
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['decisions'] });
      toast.success(`${DECISION_TYPE_LABEL} saved`, {
        description: `Your ${DECISION_TYPE_LABEL.toLowerCase()} has been recorded successfully.`,
      });
    },
    onError: (error) => {
      toast.error(`Error saving ${DECISION_TYPE_LABEL.toLowerCase()}`, {
        description: error.message,
      });
    },
  });

  const updateDecision = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<DecisionFormData> }) => {
      const updateData: DecisionUpdate = {
        title: data.title,
        summary: data.summary || null,
        context_tags: data.context_tags,
        constraints: data.constraints || null,
        options_considered: data.options_considered,
        selected_option: data.selected_option || null,
        reasoning: data.reasoning || null,
        risks_assumptions: data.risks_assumptions || null,
        confidence_level: data.confidence_level,
        estimated_impact_value: data.estimated_impact_value,
        estimated_impact_label: data.estimated_impact_label || null,
        outcome: data.outcome || null,
        is_draft: data.is_draft,
      };
      
      const { data: result, error } = await supabase
        .from('decision_records')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['decisions'] });
      toast.success(`${DECISION_TYPE_LABEL} updated`, {
        description: 'Your changes have been saved.',
      });
    },
    onError: (error) => {
      toast.error(`Error updating ${DECISION_TYPE_LABEL.toLowerCase()}`, {
        description: error.message,
      });
    },
  });

  const deleteDecision = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('decision_records')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['decisions'] });
      toast.success(`${DECISION_TYPE_LABEL} deleted`, {
        description: `The ${DECISION_TYPE_LABEL.toLowerCase()} has been removed.`,
      });
    },
    onError: (error) => {
      toast.error(`Error deleting ${DECISION_TYPE_LABEL.toLowerCase()}`, {
        description: error.message,
      });
    },
  });

  return {
    decisions: decisionsQuery.data || [],
    isLoading: decisionsQuery.isLoading,
    error: decisionsQuery.error,
    createDecision,
    updateDecision,
    deleteDecision,
  };
}

export function useDecision(id: string | undefined) {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['decision', id],
    queryFn: async () => {
      if (!id) return null;
      
      const { data, error } = await supabase
        .from('decision_records')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      
      if (error) throw error;
      return data as DecisionRecord | null;
    },
    enabled: !!user && !!id,
  });
}