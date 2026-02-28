import { cn } from "@/lib/utils";

export function LoadingSpinner({
  className,
  size = "sm",
}: {
  className?: string;
  size?: "xs" | "sm" | "md";
}) {
  const sizeClasses = {
    xs: "size-4",
    sm: "size-5",
    md: "size-8",
  };

  return (
    <div
      className={cn(
        "animate-spin rounded-full border-2 border-muted border-t-emerald-600",
        sizeClasses[size],
        className
      )}
      aria-hidden
    />
  );
}
