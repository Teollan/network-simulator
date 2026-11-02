import type { ReactNode } from 'react';

interface AsideSectionProps {
  title: string;
  description?: string;
  children?: ReactNode;
}

export const AsideSection = ({ title, description, children }: AsideSectionProps) => (
  <section className="flex flex-col gap-3">
    <header className="flex flex-col gap-1">
      <h2 className="text-sm font-semibold">
        {title}
      </h2>

      {description && (
        <p className="text-xs text-muted-foreground">
          {description}
        </p>
      )}
    </header>

    {children}
  </section>
);
