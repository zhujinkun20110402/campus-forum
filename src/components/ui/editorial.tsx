import type { LucideIcon } from "lucide-react"
import { ScrollReveal } from "@/components/effects/scroll-reveal"
import { cn } from "@/lib/utils"

interface EditorialHeroProps {
  index: string
  eyebrow: string
  title: string
  description: string
  icon: LucideIcon
  accentClass?: string
  children?: React.ReactNode
  className?: string
  compact?: boolean
}

export function EditorialHero({
  index,
  eyebrow,
  title,
  description,
  icon: Icon,
  accentClass = "bg-[#ff6b43]",
  children,
  className,
  compact = false,
}: EditorialHeroProps) {
  return (
    <section
      className={cn(
        "campus-paper relative overflow-hidden border-b-2 border-[#191914] px-4 pt-28 dark:border-[#f5f0e5] sm:px-6 lg:px-8",
        compact ? "pb-12 sm:pb-14" : "pb-16 sm:pb-20",
        className
      )}
    >
      <div aria-hidden className={cn("absolute -right-10 top-20 h-32 w-32 rotate-12 border-2 border-[#191914] dark:border-[#f5f0e5]", accentClass)} />
      <div className="relative mx-auto grid max-w-7xl items-end gap-8 md:grid-cols-[minmax(0,1fr)_auto]">
        <ScrollReveal>
          <div>
            <div className="inline-flex items-center gap-2 font-mono text-[10px] font-bold tracking-[0.18em] text-[#e4532f]">
              <span className="border border-[#191914] bg-[#fffaf0] px-2 py-1 text-[#191914] dark:border-[#f5f0e5] dark:bg-[#191914] dark:text-[#f5f0e5]">
                {index}
              </span>
              {eyebrow}
            </div>
            <h1 className="mt-5 max-w-4xl font-serif text-4xl font-bold leading-[1.05] tracking-[-0.045em] text-[#191914] dark:text-[#f5f0e5] sm:text-5xl lg:text-6xl">
              {title}
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-[#69655d] dark:text-[#aaa69c] sm:text-base">
              {description}
            </p>
            {children && <div className="mt-7">{children}</div>}
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.08} direction="left" className="hidden md:block">
          <div className={cn("flex h-28 w-28 rotate-2 items-center justify-center border-2 border-[#191914] text-[#191914] shadow-[7px_7px_0_#191914] dark:border-[#f5f0e5] dark:shadow-[7px_7px_0_#f5f0e5] lg:h-32 lg:w-32", accentClass)}>
            <Icon className="h-10 w-10 lg:h-12 lg:w-12" strokeWidth={1.7} />
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}

interface EditorialHeadingProps {
  index: string
  eyebrow: string
  title: string
  meta?: React.ReactNode
  className?: string
}

export function EditorialHeading({ index, eyebrow, title, meta, className }: EditorialHeadingProps) {
  return (
    <div className={cn("flex flex-col justify-between gap-4 border-b-2 border-[#191914] pb-5 dark:border-[#f5f0e5] sm:flex-row sm:items-end", className)}>
      <div>
        <p className="font-mono text-[9px] font-bold tracking-[0.18em] text-[#e4532f]">{index} / {eyebrow}</p>
        <h2 className="mt-2 font-serif text-3xl font-bold tracking-tight sm:text-4xl">{title}</h2>
      </div>
      {meta && <div className="text-sm text-[#777268] dark:text-[#989389]">{meta}</div>}
    </div>
  )
}

export function EditorialPanel({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={cn("border-2 border-[#191914] bg-[#fffaf0] text-[#191914] shadow-[6px_6px_0_rgba(25,25,20,0.16)] dark:border-[#f5f0e5] dark:bg-[#191914] dark:text-[#f5f0e5] dark:shadow-[6px_6px_0_rgba(245,240,229,0.12)]", className)}>
      {children}
    </div>
  )
}
