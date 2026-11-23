import * as React from 'react';
import { cn } from 'cn';
import { ChevronDownIcon } from 'lucide-react';
import { Accordion as AccordionPrimitive } from 'radix-ui';

function Accordion({
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Root>) {
  return (
    <AccordionPrimitive.Root
      data-slot="accordion"
      {...props}
    />
  );
}

function AccordionItem({
  className,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Item>) {
  return (
    <AccordionPrimitive.Item
      data-slot="accordion-item"
      className={cn('rounded-lg border', className)}
      {...props}
    />
  );
}

function AccordionHeader({
  className,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Header>) {
  return (
    <AccordionPrimitive.Header
      data-slot="accordion-header"
      className={cn('flex items-center gap-1 pr-1', className)}
      {...props}
    />
  );
}

function AccordionTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Trigger>) {
  return (
    <AccordionPrimitive.Trigger
      data-slot="accordion-trigger"
      className={cn(
        'group/accordion-trigger flex min-w-0 flex-1 items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm font-medium outline-none focus-visible:ring-3 focus-visible:ring-ring/50',
        className,
      )}
      {...props}
    >
      <ChevronDownIcon className="size-4 shrink-0 text-muted-foreground transition-transform group-data-[state=open]/accordion-trigger:rotate-180" />

      {children}
    </AccordionPrimitive.Trigger>
  );
}

function AccordionContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Content>) {
  return (
    <AccordionPrimitive.Content
      data-slot="accordion-content"
      className="overflow-hidden text-sm"
      {...props}
    >
      <div className={cn('px-2.5 pb-2.5', className)}>
        {children}
      </div>
    </AccordionPrimitive.Content>
  );
}

export {
  Accordion,
  AccordionContent,
  AccordionHeader,
  AccordionItem,
  AccordionTrigger,
};
