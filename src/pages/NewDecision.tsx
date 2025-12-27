import { DecisionForm } from '@/components/decisions/DecisionForm';
import { AppLayout } from '@/components/layout/AppLayout';

export default function NewDecision() {
  return (
    <AppLayout>
      <DecisionForm mode="create" />
    </AppLayout>
  );
}