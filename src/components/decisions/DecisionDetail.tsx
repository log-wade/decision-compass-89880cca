import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDecision, useDecisions } from '@/hooks/useDecisions';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  FIELD_LABELS,
  CONFIDENCE_LABELS,
  DECISION_TYPE_LABEL,
  DECISION_TYPE_PLURAL,
} from '@/lib/sales-config';
import {
  ArrowLeft,
  Edit,
  Trash2,
  Clock,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  FileText,
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

export function DecisionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: decision, isLoading, error } = useDecision(id);
  const { deleteDecision } = useDecisions();

  const handleDelete = async () => {
    if (!id) return;
    await deleteDecision.mutateAsync(id);
    navigate('/');
  };

  const formatCurrency = (value: number | null) => {
    if (!value) return null;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !decision) {
    return (
      <div className="text-center py-12">
        <FileText className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
        <h2 className="text-xl font-display font-semibold mb-2">{DECISION_TYPE_LABEL} not found</h2>
        <p className="text-muted-foreground mb-4">
          This {DECISION_TYPE_LABEL.toLowerCase()} may have been deleted or you don't have access to it.
        </p>
        <Button asChild>
          <Link to="/">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to {DECISION_TYPE_PLURAL}
          </Link>
        </Button>
      </div>
    );
  }

  const options = (decision.options_considered as { label: string; description: string }[]) || [];

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <Button variant="ghost" size="sm" asChild className="mb-2 -ml-2">
            <Link to="/">
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back
            </Link>
          </Button>
          <div className="flex items-center gap-2 mb-1">
            {decision.is_draft && (
              <Badge variant="secondary">Draft</Badge>
            )}
            <Badge variant="outline" className="text-xs">
              {DECISION_TYPE_LABEL}
            </Badge>
          </div>
          <h1 className="text-2xl font-display font-bold text-foreground">
            {decision.title}
          </h1>
          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {format(new Date(decision.created_at), 'MMMM d, yyyy')}
            </span>
            {decision.estimated_impact_value && (
              <span className="flex items-center gap-1 text-success">
                <TrendingUp className="w-4 h-4" />
                {formatCurrency(decision.estimated_impact_value)}
                {decision.estimated_impact_label && ` (${decision.estimated_impact_label})`}
              </span>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link to={`/decisions/${id}/edit`}>
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Link>
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="icon" className="text-destructive hover:text-destructive">
                <Trash2 className="w-4 h-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete this {DECISION_TYPE_LABEL.toLowerCase()}?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the {DECISION_TYPE_LABEL.toLowerCase()}
                  and all associated data.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Context Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Context
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {decision.summary && (
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-1">
                {FIELD_LABELS.summary}
              </h4>
              <p className="text-foreground whitespace-pre-wrap">{decision.summary}</p>
            </div>
          )}
          
          {decision.context_tags && decision.context_tags.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-2">
                {FIELD_LABELS.contextTags}
              </h4>
              <div className="flex flex-wrap gap-2">
                {decision.context_tags.map((tag) => (
                  <Badge key={tag} variant="secondary">{tag}</Badge>
                ))}
              </div>
            </div>
          )}
          
          {decision.constraints && (
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-1">
                {FIELD_LABELS.constraints}
              </h4>
              <p className="text-foreground whitespace-pre-wrap">{decision.constraints}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Options Considered */}
      {options.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{FIELD_LABELS.optionsConsidered}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {options.map((option, index) => (
              <div
                key={index}
                className={cn(
                  'p-4 rounded-lg border',
                  option.label === decision.selected_option
                    ? 'border-primary bg-primary/5'
                    : 'border-border bg-muted/30'
                )}
              >
                <div className="flex items-center gap-2 mb-1">
                  {option.label === decision.selected_option && (
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                  )}
                  <h4 className="font-medium">{option.label}</h4>
                  {option.label === decision.selected_option && (
                    <Badge className="text-xs">Selected</Badge>
                  )}
                </div>
                {option.description && (
                  <p className="text-sm text-muted-foreground">{option.description}</p>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Reasoning Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-success" />
            Decision & Reasoning
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {decision.selected_option && (
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-1">
                {FIELD_LABELS.selectedOption}
              </h4>
              <p className="text-foreground font-medium">{decision.selected_option}</p>
            </div>
          )}
          
          {decision.reasoning && (
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-1">
                {FIELD_LABELS.reasoning}
              </h4>
              <p className="text-foreground whitespace-pre-wrap">{decision.reasoning}</p>
            </div>
          )}
          
          <Separator />
          
          <div className="flex items-center gap-4">
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-1">
                {FIELD_LABELS.confidenceLevel}
              </h4>
              <div className="flex items-center gap-2">
                <span className={cn('confidence-badge', `confidence-${decision.confidence_level || '3'}`)}>
                  {decision.confidence_level || '3'}
                </span>
                <span className="text-sm text-muted-foreground">
                  {CONFIDENCE_LABELS[(decision.confidence_level || '3') as '1' | '2' | '3' | '4' | '5']}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Risks Section */}
      {decision.risks_assumptions && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-warning" />
              {FIELD_LABELS.risksAssumptions}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-foreground whitespace-pre-wrap">{decision.risks_assumptions}</p>
          </CardContent>
        </Card>
      )}

      {/* Outcome Section */}
      {decision.outcome && (
        <Card className="border-success/50 bg-success/5">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2 text-success">
              <TrendingUp className="w-5 h-5" />
              {FIELD_LABELS.outcome}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-foreground whitespace-pre-wrap">{decision.outcome}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}