export function Panel({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <section
      data-animate
      className={`relative overflow-hidden rounded-md border border-ink/10 bg-steelWhite/90 p-6 shadow-panel backdrop-blur transition duration-200 hover:-translate-y-0.5 hover:border-ink/20 ${className}`}
    >
      {children}
    </section>
  );
}
