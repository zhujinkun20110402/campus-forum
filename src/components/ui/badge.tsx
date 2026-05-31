import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-stone-950",
  {
    variants: {
      variant: {
        default: "border-transparent bg-stone-800 text-white dark:bg-stone-200 dark:text-stone-800",
        secondary: "border-transparent bg-stone-100 text-stone-800 dark:bg-stone-800 dark:text-stone-200",
        destructive: "border-transparent bg-red-600 text-white dark:bg-red-500",
        outline: "text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }