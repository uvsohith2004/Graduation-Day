import { GUEST_MAX } from "@/constants/register-data";
import { Users } from "lucide-react";

export function GuestCounter({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center justify-between p-4 rounded-2xl border border-border bg-muted/30">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
          <Users className="w-4 h-4 text-primary" />
        </div>
        <div>
          <p className="text-sm font-medium text-foreground">Guests</p>
          <p className="text-xs text-muted-foreground">Max {GUEST_MAX} additional</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => onChange(Math.max(0, value - 1))}
          className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-foreground hover:bg-accent transition-colors disabled:opacity-40"
          disabled={value === 0}
        >
          <span className="text-base leading-none">−</span>
        </button>
        <span className="text-lg font-semibold text-foreground w-5 text-center">{value}</span>
        <button
          type="button"
          onClick={() => onChange(Math.min(GUEST_MAX, value + 1))}
          className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-40"
          disabled={value === GUEST_MAX}
        >
          <span className="text-base leading-none">+</span>
        </button>
      </div>
    </div>
  );
}
