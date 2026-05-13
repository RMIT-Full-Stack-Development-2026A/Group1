export default function LoadingScreen({ message = "LOADING..." }) {
  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center gap-4 bg-background">
      <div
        className="flex items-center justify-center gap-1"
        aria-hidden="true"
      >
        <span className="h-2 w-2 bg-primary animate-pulse" />
        <span className="h-2 w-2 bg-primary animate-pulse [animation-delay:150ms]" />
        <span className="h-2 w-2 bg-primary animate-pulse [animation-delay:300ms]" />
        <span className="h-2 w-2 bg-primary animate-pulse [animation-delay:450ms]" />
      </div>

      <p className="font-headline text-[10px] uppercase tracking-widest text-primary animate-pulse">
        {message}
      </p>
    </div>
  );
}