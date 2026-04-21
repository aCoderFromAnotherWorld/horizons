import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function BigButton({
  children,
  className,
  icon: Icon,
  asChild = false,
  ...props
}) {
  return (
    <Button
      size="lg"
      className={cn(
        "min-h-16 min-w-16 rounded-lg px-6 py-5 text-lg font-black shadow-lg transition-transform hover:scale-[1.01] active:scale-[0.99] sm:px-8 sm:text-xl",
        className,
      )}
      asChild={asChild}
      {...props}
    >
      {asChild ? (
        children
      ) : (
        <>
          {Icon ? <Icon className="h-6 w-6" /> : null}
          {children}
        </>
      )}
    </Button>
  );
}
