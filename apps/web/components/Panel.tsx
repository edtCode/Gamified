export function Panel({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <section
      className={`relative overflow-hidden rounded-lg border border-transparent bg-white/80 p-6 shadow-lg backdrop-blur transition hover:shadow-xl hover:border-ink/10 glow-border ${className}`}
      style={{
        background: "linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(249,250,251,0.8) 100%)",
      }}
    >
      <div className="absolute inset-0 pointer-events-none opacity-0 hover:opacity-50 transition-opacity duration-500" style={{
        backgroundImage: "radial-gradient(600px at 50% 50%, rgba(99, 102, 241, 0.05), transparent)",
      }} />
      <div className="relative z-10">{children}</div>
    </section>
  );
}
