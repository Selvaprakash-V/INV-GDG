import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

// The shared Badge only ships default/secondary/destructive/outline variants,
// so warning/success tones are expressed with colour classes on `outline`.
const TONES = {
  danger: { variant: 'destructive', className: '' },
  warning: { variant: 'outline', className: 'border-amber-300 bg-amber-100 text-amber-800' },
  success: { variant: 'outline', className: 'border-green-300 bg-green-100 text-green-800' },
  info: { variant: 'outline', className: 'border-blue-300 bg-blue-50 text-blue-800' },
  neutral: { variant: 'outline', className: '' },
  primary: { variant: 'default', className: '' },
};

export default function ToneBadge({ tone = 'neutral', className, children, ...props }) {
  const t = TONES[tone] || TONES.neutral;
  return (
    <Badge variant={t.variant} className={cn(t.className, className)} {...props}>
      {children}
    </Badge>
  );
}
