import type { CSSProperties } from 'react';
import { CircleCheck, Info, LoaderCircle, OctagonX, TriangleAlert } from 'lucide-react';
import { Toaster as Sonner, type ToasterProps } from 'sonner';

const Toaster = ({ ...props }: ToasterProps) => (
  <Sonner
    theme="system"
    className="toaster group"
    icons={{
      success: <CircleCheck className="size-4" />,
      info: <Info className="size-4" />,
      warning: <TriangleAlert className="size-4" />,
      error: <OctagonX className="size-4" />,
      loading: <LoaderCircle className="size-4 animate-spin" />,
    }}
    style={{
      '--normal-bg': 'var(--popover)',
      '--normal-text': 'var(--popover-foreground)',
      '--normal-border': 'var(--border)',
      '--border-radius': 'var(--radius)',
    } as CSSProperties}
    toastOptions={{
      classNames: {
        toast: 'cn-toast',
      },
    }}
    {...props}
  />
);

export { Toaster };
