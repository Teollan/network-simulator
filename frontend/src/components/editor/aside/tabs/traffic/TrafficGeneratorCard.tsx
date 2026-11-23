import {
  Pencil,
  Trash2,
} from 'lucide-react';
import {
  describeTrafficGenerator,
  summarizeTrafficGenerator,
  type NodeLabelFn,
} from '@/components/editor/aside/tabs/traffic/describeTrafficGenerator';
import {
  AccordionContent,
  AccordionHeader,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/Accordion';
import { Button } from '@/components/ui/Button';
import type { TrafficGeneratorEntry } from '@/stores/useTrafficStore';

interface TrafficGeneratorCardProps {
  entry: TrafficGeneratorEntry;
  labelOf: NodeLabelFn;
  onEdit: () => void;
  onDelete: () => void;
}

export const TrafficGeneratorCard = ({
  entry,
  labelOf,
  onEdit,
  onDelete,
}: TrafficGeneratorCardProps) => {
  const summary = summarizeTrafficGenerator(entry.config);

  return (
    <AccordionItem value={`${entry.id}`}>
      <AccordionHeader>
        <AccordionTrigger>
          <span className="truncate">
            {summary}
          </span>
        </AccordionTrigger>

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
          {describeTrafficGenerator(entry.config, labelOf).map(({
            term,
            description,
          }, idx) => (
            <div
              key={idx}
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
