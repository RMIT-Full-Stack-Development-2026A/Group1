export default function ErrorScreen({ message = "AN ERROR OCCURRED" }) {
  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center gap-4 bg-background">
      <div
        className="flex h-16 w-16 items-center justify-center border-2 border-error text-error"
        aria-hidden="true"
      >
        <span className="font-headline text-2xl leading-none">⚠</span>
      </div>

      <p className="font-headline text-[10px] uppercase tracking-widest text-error animate-pulse">
        {message}
      </p>

      <p className="font-mono text-[9px] text-on-surface-variant">
        Redirecting...
      </p>
    </div>
  );
}
