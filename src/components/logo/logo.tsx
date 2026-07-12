import { cn } from "@/lib/utils";

export default function Logo({ className }: { className?: string }) {
  return (
    <>
      <div className={cn(className)}>
        <img className="max-w-full max-h-full" src="/logo.png" />
      </div>
    </>
  );
}
