export function StatCard({ title, value }: { title: string; value: string | number }) {
  return (
    <div
      className="flex flex-col justify-center items-center text-center h-30 rounded-xl
      bg-glass-bg bg-background/90 border border-glass-border shadow-sm backdrop-blur-md
      text-foreground transition-colors"
    >
      <p className="text-base md:text-lg font-medium text-muted-foreground">{title}</p>
      <p className="text-3xl font-bold mt-2">{value}</p>
    </div>
  );
}
