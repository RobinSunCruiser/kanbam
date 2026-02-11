'use client';

import * as React from 'react';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/style.css';
import { cn } from '@/lib/utils/cn';

function Calendar({
  className,
  style,
  ...props
}: React.ComponentProps<typeof DayPicker>) {
  return (
    <DayPicker
      showOutsideDays
      className={cn('p-3', className)}
      style={{
        '--rdp-accent-color': 'var(--primary)',
        '--rdp-accent-background-color': 'color-mix(in srgb, var(--primary) 10%, transparent)',
        '--rdp-today-color': 'var(--primary)',
        '--rdp-selected-border': '2px solid var(--primary)',
        '--rdp-day_button-border-radius': '0.5rem',
        ...style,
      } as React.CSSProperties}
      {...props}
    />
  );
}

export { Calendar };
