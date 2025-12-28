import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useDecisions, DecisionFormData } from '@/hooks/useDecisions';
import {
  FIELD_LABELS,
  FIELD_PLACEHOLDERS,
  CONTEXT_TAGS,
  CONFIDENCE_LABELS,
  DECISION_TYPE_LABEL,
} from '@/lib/sales-config';
import { Plus, X, Save, Send, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Option {
  label: string;
  description: string;
}

interface DecisionFormProps {
  initialData?: Partial<DecisionFormData>;
  decisionId?: string;
  mode?: 'create' | 'edit';
  isFirstDecision?: boolean;
}

export function DecisionForm({ initialData, decisionId, mode = 'create', isFirstDecision = false }: DecisionFormProps) {
  const navigate = useNavigate();
  const { createDecision, updateDecision } = useDecisions();
  
  const [title, setTitle] = useState(initialData?.title || '');
  const [summary, setSummary] = useState(initialData?.summary || '');
  const [selectedTags, setSelectedTags] = useState<string[]>(initialData?.context_tags || []);
  const [constraints, setConstraints] = useState(initialData?.constraints || '');
  const [options, setOptions] = useState<Option[]>(
    initialData?.options_considered || [{ label: '', description: '' }]
  );
  const [selectedOption, setSelectedOption] = useState(initialData?.selected_option || '');
  const [reasoning, setReasoning] = useState(initialData?.reasoning || '');
  const [risksAssumptions, setRisksAssumptions] = useState(initialData?.risks_assumptions || '');
  const [confidenceLevel, setConfidenceLevel] = useState<'1' | '2' | '3' | '4' | '5'>(
    initialData?.confidence_level || '3'
  );
  const [impactValue, setImpactValue] = useState<string>(
    initialData?.estimated_impact_value?.toString() || ''
  );
  const [impactLabel, setImpactLabel] = useState(initialData?.estimated_impact_label || '');
  const [outcome, setOutcome] = useState(initialData?.outcome || '');

  const isSubmitting = createDecision.isPending || updateDecision.isPending;

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const addOption = () => {
    setOptions([...options, { label: '', description: '' }]);
  };

  const removeOption = (index: number) => {
    if (options.length > 1) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const updateOption = (index: number, field: 'label' | 'description', value: string) => {
    const newOptions = [...options];
    newOptions[index][field] = value;
    setOptions(newOptions);
  };

  const buildFormData = (isDraft: boolean): DecisionFormData => ({
    title,
    summary,
    context_tags: selectedTags,
    constraints,
    options_considered: options.filter(o => o.label.trim()),
    selected_option: selectedOption,
    reasoning,
    risks_assumptions: risksAssumptions,
    confidence_level: confidenceLevel,
    estimated_impact_value: impactValue ? parseFloat(impactValue) : null,
    estimated_impact_label: impactLabel,
    outcome,
    is_draft: isDraft,
  });

  const handleSaveDraft = async () => {
    if (!title.trim()) return;
    
    const data = buildFormData(true);
    
    if (mode === 'edit' && decisionId) {
      await updateDecision.mutateAsync({ id: decisionId, data });
    } else {
      await createDecision.mutateAsync(data);
    }
    navigate('/decisions');
  };

  const handleSubmit = async () => {
    if (!title.trim()) return;
    
    const data = buildFormData(false);
    
    if (mode === 'edit' && decisionId) {
      await updateDecision.mutateAsync({ id: decisionId, data });
    } else {
      await createDecision.mutateAsync(data);
    }
    navigate('/decisions');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      {/* Onboarding header for first-time users */}
      {isFirstDecision && mode === 'create' && (
        <div className="text-center pb-4">
          <p className="text-lg text-muted-foreground">
            Document the decision while it's still clear.
          </p>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">
            {mode === 'edit' ? `Edit ${DECISION_TYPE_LABEL}` : `New ${DECISION_TYPE_LABEL}`}
          </h1>
          <p className="text-muted-foreground mt-1">
            Capture the {DECISION_TYPE_LABEL.toLowerCase()} and reasoning for future reference
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handleSaveDraft}
            disabled={isSubmitting || !title.trim()}
          >
            {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Save Draft
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !title.trim()}
          >
            {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
            Submit
          </Button>
        </div>
      </div>

      {/* Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{FIELD_LABELS.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Input
              placeholder={FIELD_PLACEHOLDERS.title}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-lg"
            />
          </div>
          
          <div className="space-y-2">
            <Label>{FIELD_LABELS.summary}</Label>
            <Textarea
              placeholder={FIELD_PLACEHOLDERS.summary}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              rows={4}
            />
          </div>
        </CardContent>
      </Card>

      {/* Context Tags */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{FIELD_LABELS.contextTags}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {CONTEXT_TAGS.map((tag) => (
              <Badge
                key={tag}
                variant={selectedTags.includes(tag) ? 'default' : 'outline'}
                className={cn(
                  'cursor-pointer transition-colors',
                  selectedTags.includes(tag)
                    ? 'bg-primary hover:bg-primary/90'
                    : 'hover:bg-muted'
                )}
                onClick={() => toggleTag(tag)}
              >
                {tag}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Constraints */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{FIELD_LABELS.constraints}</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder={FIELD_PLACEHOLDERS.constraints}
            value={constraints}
            onChange={(e) => setConstraints(e.target.value)}
            rows={3}
          />
        </CardContent>
      </Card>

      {/* Options Considered */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">{FIELD_LABELS.optionsConsidered}</CardTitle>
          <Button variant="outline" size="sm" onClick={addOption}>
            <Plus className="w-4 h-4 mr-1" />
            Add Option
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {options.map((option, index) => (
            <div key={index} className="p-4 rounded-lg border border-border bg-muted/30 space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Option {index + 1}</Label>
                {options.length > 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeOption(index)}
                    className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
              <Input
                placeholder={FIELD_PLACEHOLDERS.optionLabel}
                value={option.label}
                onChange={(e) => updateOption(index, 'label', e.target.value)}
              />
              <Textarea
                placeholder={FIELD_PLACEHOLDERS.optionDescription}
                value={option.description}
                onChange={(e) => updateOption(index, 'description', e.target.value)}
                rows={2}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Selected Option & Reasoning */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Decision</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>{FIELD_LABELS.selectedOption}</Label>
            <Input
              placeholder={FIELD_PLACEHOLDERS.selectedOption}
              value={selectedOption}
              onChange={(e) => setSelectedOption(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label>{FIELD_LABELS.reasoning}</Label>
            <Textarea
              placeholder={FIELD_PLACEHOLDERS.reasoning}
              value={reasoning}
              onChange={(e) => setReasoning(e.target.value)}
              rows={4}
            />
          </div>
        </CardContent>
      </Card>

      {/* Risks & Confidence */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Assessment</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>{FIELD_LABELS.risksAssumptions}</Label>
            <Textarea
              placeholder={FIELD_PLACEHOLDERS.risksAssumptions}
              value={risksAssumptions}
              onChange={(e) => setRisksAssumptions(e.target.value)}
              rows={3}
            />
          </div>
          
          <div className="space-y-2">
            <Label>{FIELD_LABELS.confidenceLevel}</Label>
            <Select value={confidenceLevel} onValueChange={(v) => setConfidenceLevel(v as typeof confidenceLevel)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(CONFIDENCE_LABELS).map(([level, label]) => (
                  <SelectItem key={level} value={level}>
                    <span className={`confidence-badge confidence-${level}`}>
                      {level}
                    </span>
                    <span className="ml-2">{label}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Impact */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{FIELD_LABELS.estimatedImpact}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Value ($)</Label>
              <Input
                type="number"
                placeholder="50000"
                value={impactValue}
                onChange={(e) => setImpactValue(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Label</Label>
              <Input
                placeholder={FIELD_PLACEHOLDERS.impactLabel}
                value={impactLabel}
                onChange={(e) => setImpactLabel(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Outcome (for editing) */}
      {mode === 'edit' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{FIELD_LABELS.outcome}</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder={FIELD_PLACEHOLDERS.outcome}
              value={outcome}
              onChange={(e) => setOutcome(e.target.value)}
              rows={3}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}