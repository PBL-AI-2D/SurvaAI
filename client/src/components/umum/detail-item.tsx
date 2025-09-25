interface DetailItemProps {
  label: string;
  value: string | number;
}

export const DetailItem = ({ label, value }: DetailItemProps) => (
  <div className="flex justify-between items-start py-2 border-b border-glass-border">
    <span className="text-sm text-muted-foreground">{label}</span>
    <span className="text-sm font-medium text-foreground text-right max-w-[60%] break-words">
      {value}
    </span>
  </div>
);
