import {
  ArrowDown,
  ArrowUp,
  Pencil,
  Trash2,
} from 'lucide-react';
import {
  describeTopologyRule,
  summarizeTopologyRule,
} from '@/components/editor/aside/tabs/topology/describeTopologyRule';
import {
  AccordionContent,
  AccordionHeader,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/Accordion';
import { Button } from '@/components/ui/Button';
import type { TopologyBuilderAction } from '@/modules/network/builder/TopologySpec';

interface TopologyRuleCardProps {
  value: string;
  action: TopologyBuilderAction;
  position: number;
  isFirst: boolean;
  isLast: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}

export const TopologyRuleCard = ({
  value,
  action,
  position,
  isFirst,
  isLast,
  onEdit,
  onDelete,
  onMoveUp,
  onMoveDown,
}: TopologyRuleCardProps) => {
  const summary = summarizeTopologyRule(action);

  return (
    <AccordionItem value={value}>
      <AccordionHeader className="gap-0.5">
        <AccordionTrigger>
          <span className="w-4 shrink-0 text-xs text-muted-foreground tabular-nums">
            {position}
          </span>

          <span className="truncate">
            {summary}
          </span>
        </AccordionTrigger>

        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          aria-label={`Move ${summary} up`}
          disabled={isFirst}
          onClick={onMoveUp}
        >
          <ArrowUp />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          aria-label={`Move ${summary} down`}
          disabled={isLast}
          onClick={onMoveDown}
        >
          <ArrowDown />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          aria-label={`Edit ${summary}`}
          onClick={onEdit}
        >
          <Pencil />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          className="text-destructive hover:text-destructive"
          aria-label={`Delete ${summary}`}
          onClick={onDelete}
        >
          <Trash2 />
        </Button>
      </AccordionHeader>

      <AccordionContent>
        <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-xs">
          {describeTopologyRule(action).map(({
            term,
            description,
          }) => (
            <div
              key={term}
              className="contents"
            >
              <dt className="text-muted-foreground">
                {term}
              </dt>

              <dd>
                {description}
              </dd>
            </div>
          ))}
        </dl>
      </AccordionContent>
    </AccordionItem>
  );
};
