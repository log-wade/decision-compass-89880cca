import { useParams } from 'react-router-dom';
import { DecisionForm } from '@/components/decisions/DecisionForm';
import { AppLayout } from '@/components/layout/AppLayout';
import { useDecision } from '@/hooks/useDecisions';
import { Loader2 } from 'lucide-react';
import { DECISION_TYPE_LABEL } from '@/lib/sales-config';

export default function EditDecision() {
  const { id } = useParams();
  const { data: decision, isLoading } = useDecision(id);

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  if (!decision) {
    return (
      <AppLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">{DECISION_TYPE_LABEL} not found</p>
        </div>
      </AppLayout>
    );
  }

  const initialData = {
    title: decision.title,
    summary: decision.summary || '',
    context_tags: decision.context_tags || [],
    constraints: decision.constraints || '',
    options_considered: (decision.options_considered as { label: string; description: string }[]) || [],
    selected_option: decision.selected_option || '',
    reasoning: decision.reasoning || '',
    risks_assumptions: decision.risks_assumptions || '',
    confidence_level: (decision.confidence_level || '3') as '1' | '2' | '3' | '4' | '5',
    estimated_impact_value: decision.estimated_impact_value,
    estimated_impact_label: decision.estimated_impact_label || '',
    outcome: decision.outcome || '',
    is_draft: decision.is_draft || false,
  };

  return (
    <AppLayout>
      <DecisionForm 
        mode="edit" 
        decisionId={id} 
        initialData={initialData}
      />
    </AppLayout>
  );
}