import { Label } from "@/components/ui/label";

interface FieldProps {
  label: string;
  hint?: string;
  children: React.ReactNode;
}

export const Field = ({ label, children, hint }: FieldProps) => (
  <div>
    <Label className="text-foreground">{label}</Label>
    <div className="mt-1">{children}</div>
    {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
  </div>
);
