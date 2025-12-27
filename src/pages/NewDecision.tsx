import { DecisionForm } from '@/components/decisions/DecisionForm';
import { AppLayout } from '@/components/layout/AppLayout';
import { useDecisions } from '@/hooks/useDecisions';

export default function NewDecision() {
  const { decisions, isLoading } = useDecisions();
  const isFirstDecision = !isLoading && decisions.length === 0;

  return (
    <AppLayout>
      <DecisionForm mode="create" isFirstDecision={isFirstDecision} />
    </AppLayout>
  );
}