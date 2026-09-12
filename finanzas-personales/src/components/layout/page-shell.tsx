import { cn } from "@/lib/utils";

export function PageShell({
  children,
  className,
  wide = false,
}: {
  children: React.ReactNode;
  className?: string;
  /** Wider measure on desktop (forms / dense lists stay comfortable) */
  wide?: boolean;
}) {
  return (
    <div
      className={cn(
        "page-shell mx-auto w-full space-y-5 px-4 py-5 sm:px-5",
        wide
          ? "max-w-lg md:max-w-3xl lg:max-w-5xl md:px-8 lg:px-10"
          : "max-w-lg md:max-w-2xl lg:max-w-3xl md:px-8",
        className
      )}
    >
      {children}
    </div>
  );
}
