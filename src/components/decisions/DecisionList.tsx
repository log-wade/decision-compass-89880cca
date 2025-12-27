import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useDecisions } from '@/hooks/useDecisions';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CONTEXT_TAGS, CONFIDENCE_LABELS, DECISION_TYPE_PLURAL } from '@/lib/sales-config';
import { Search, Filter, Plus, FileText, Clock, TrendingUp, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

export function DecisionList() {
  const { decisions, isLoading } = useDecisions();
  const [searchQuery, setSearchQuery] = useState('');
  const [tagFilter, setTagFilter] = useState<string>('all');
  const [confidenceFilter, setConfidenceFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'confidence' | 'impact'>('recent');

  const filteredDecisions = useMemo(() => {
    let result = [...decisions];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (d) =>
          d.title.toLowerCase().includes(query) ||
          d.summary?.toLowerCase().includes(query) ||
          d.reasoning?.toLowerCase().includes(query) ||
          d.selected_option?.toLowerCase().includes(query)
      );
    }

    // Tag filter
    if (tagFilter !== 'all') {
      result = result.filter((d) => d.context_tags?.includes(tagFilter));
    }

    // Confidence filter
    if (confidenceFilter !== 'all') {
      result = result.filter((d) => d.confidence_level === confidenceFilter);
    }

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case 'confidence':
          return (parseInt(b.confidence_level || '3') - parseInt(a.confidence_level || '3'));
        case 'impact':
          return ((b.estimated_impact_value || 0) - (a.estimated_impact_value || 0));
        case 'recent':
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });

    return result;
  }, [decisions, searchQuery, tagFilter, confidenceFilter, sortBy]);

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

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">{DECISION_TYPE_PLURAL}</h1>
          <p className="text-muted-foreground">
            {decisions.length} decision{decisions.length !== 1 ? 's' : ''} recorded
          </p>
        </div>
        <Button asChild>
          <Link to="/decisions/new">
            <Plus className="w-4 h-4 mr-2" />
            New Decision
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search decisions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          
          <div className="flex gap-2 flex-wrap sm:flex-nowrap">
            <Select value={tagFilter} onValueChange={setTagFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="All Tags" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tags</SelectItem>
                {CONTEXT_TAGS.map((tag) => (
                  <SelectItem key={tag} value={tag}>{tag}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={confidenceFilter} onValueChange={setConfidenceFilter}>
              <SelectTrigger className="w-full sm:w-[160px]">
                <SelectValue placeholder="All Confidence" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Confidence</SelectItem>
                {Object.entries(CONFIDENCE_LABELS).map(([level, label]) => (
                  <SelectItem key={level} value={level}>Level {level}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
              <SelectTrigger className="w-full sm:w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Most Recent</SelectItem>
                <SelectItem value="confidence">Confidence</SelectItem>
                <SelectItem value="impact">Impact Value</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Decision List */}
      {filteredDecisions.length === 0 ? (
        <Card className="p-12 text-center">
          <FileText className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">
            {decisions.length === 0 ? 'No decisions yet' : 'No matching decisions'}
          </h3>
          <p className="text-muted-foreground mb-4">
            {decisions.length === 0
              ? 'Start by recording your first decision.'
              : 'Try adjusting your search or filters.'}
          </p>
          {decisions.length === 0 && (
            <Button asChild>
              <Link to="/decisions/new">
                <Plus className="w-4 h-4 mr-2" />
                Record First Decision
              </Link>
            </Button>
          )}
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredDecisions.map((decision) => (
            <Link key={decision.id} to={`/decisions/${decision.id}`}>
              <Card className="card-hover p-4 cursor-pointer">
                <CardContent className="p-0">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {decision.is_draft && (
                          <Badge variant="secondary" className="text-xs">Draft</Badge>
                        )}
                        <h3 className="font-medium text-foreground truncate">
                          {decision.title}
                        </h3>
                      </div>
                      
                      {decision.summary && (
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                          {decision.summary}
                        </p>
                      )}
                      
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {decision.context_tags?.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {(decision.context_tags?.length || 0) > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{(decision.context_tags?.length || 0) - 3} more
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {format(new Date(decision.created_at), 'MMM d, yyyy')}
                        </span>
                        {decision.estimated_impact_value && (
                          <span className="flex items-center gap-1 text-success">
                            <TrendingUp className="w-3.5 h-3.5" />
                            {formatCurrency(decision.estimated_impact_value)}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex-shrink-0">
                      <span className={cn('confidence-badge', `confidence-${decision.confidence_level || '3'}`)}>
                        {decision.confidence_level || '3'}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}