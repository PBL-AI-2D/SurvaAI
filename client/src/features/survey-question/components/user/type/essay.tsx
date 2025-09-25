'use client';

interface Props {
  disabled?: boolean;
}

export function EssayQuestion({ disabled = true }: Props) {
  return (
    <div className="">
      <p className="font-semibold text-foreground">Essay</p>
      <textarea
        className="w-full mt-3 text-sm sm:text-base rounded-lg px-4 py-2 resize-none
          bg-background/40 border border-glass-border backdrop-blur-sm 
          text-foreground placeholder:text-foreground/60 
          focus:outline-none focus:ring-2 focus:ring-ring/40 focus:border-glass-border 
          transition duration-150 ease-in-out"
        rows={2}
        placeholder="Write your answer here..."
        disabled={true}
        style={{
          background: 'var(--glass-background)',
          borderColor: 'var(--glass-border)',
          backdropFilter: 'var(--glass-blur)',
        }}
      />
    </div>
  );
}
