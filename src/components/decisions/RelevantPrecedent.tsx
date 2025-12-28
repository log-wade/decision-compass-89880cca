import { Link } from 'react-router-dom';
import { useDecisionLinks, getRelationshipLabel } from '@/hooks/useDecisionLinks';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { History, ExternalLink } from 'lucide-react';
import { DECISION_TYPE_PLURAL } from '@/lib/sales-config';

interface RelevantPrecedentProps {
  decisionId: string | undefined;
}

export function RelevantPrecedent({ decisionId }: RelevantPrecedentProps) {
  const { linkedDecisions, isLoading } = useDecisionLinks(decisionId);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <History className="w-5 h-5 text-primary" />
            Relevant Precedent
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="p-4 rounded-lg border border-border">
              <Skeleton className="h-5 w-3/4 mb-2" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-1/2 mt-1" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <History className="w-5 h-5 text-primary" />
          Relevant Precedent
        </CardTitle>
      </CardHeader>
      <CardContent>
        {linkedDecisions.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <History className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">
              No related {DECISION_TYPE_PLURAL.toLowerCase()} yet.
            </p>
            <p className="text-xs mt-1 opacity-75">
              Over time, similar {DECISION_TYPE_PLURAL.toLowerCase()} will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {linkedDecisions.map((linked) => (
              <Link
                key={linked.id}
                to={`/decisions/${linked.id}`}
                className="block p-4 rounded-lg border border-border hover:border-primary/50 hover:bg-accent/50 transition-colors group"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-foreground truncate group-hover:text-primary transition-colors">
                        {linked.title}
                      </h4>
                      <ExternalLink className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                    </div>
                    {linked.summary && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {linked.summary}
                      </p>
                    )}
                  </div>
                  <Badge variant="secondary" className="flex-shrink-0 text-xs">
                    {getRelationshipLabel(linked.relationship_type)}
                  </Badge>
                </div>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
