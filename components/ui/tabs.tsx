"use client"

import * as React from "react"
import { useState, useRef, useEffect, useCallback } from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Tabs as TabsPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

function Tabs({
  className,
  orientation = "horizontal",
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      data-orientation={orientation}
      className={cn("group/tabs flex flex-col gap-2", className)}
      {...props}
    />
  )
}

const tabsListVariants = cva(
  "group/tabs-list inline-flex items-center justify-center rounded-xl p-1 text-muted-foreground group-data-horizontal/tabs:h-10 max-sm:group-data-horizontal/tabs:h-auto max-sm:min-h-11 group-data-vertical/tabs:h-fit group-data-vertical/tabs:flex-col data-[variant=line]:rounded-none",
  {
    variants: {
      variant: {
        default: "bg-muted/60",
        line: "gap-1 bg-transparent",
        slider: "bg-muted/60 relative rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function TabsList({
  className,
  variant = "default",
  children,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List> &
  VariantProps<typeof tabsListVariants>) {
  const listRef = useRef<HTMLDivElement>(null)
  const [indicatorStyle, setIndicatorStyle] = useState<React.CSSProperties>({ opacity: 0 })

  const updateIndicator = useCallback(() => {
    if (!listRef.current) return
    const activeTrigger = listRef.current.querySelector<HTMLElement>(
      '[data-slot="tabs-trigger"][data-state="active"]'
    )
    if (!activeTrigger) {
      setIndicatorStyle({ opacity: 0 })
      return
    }
    const listRect = listRef.current.getBoundingClientRect()
    const triggerRect = activeTrigger.getBoundingClientRect()
    setIndicatorStyle({
      left: triggerRect.left - listRect.left,
      width: triggerRect.width,
      opacity: 1,
    })
  }, [])

  useEffect(() => {
    updateIndicator()

    const list = listRef.current
    if (!list) return

    const observer = new MutationObserver(() => {
      requestAnimationFrame(updateIndicator)
    })
    observer.observe(list, {
      attributes: true,
      subtree: true,
      attributeFilter: ["data-state"],
    })

    const resizeObserver = new ResizeObserver(() => {
      requestAnimationFrame(updateIndicator)
    })
    resizeObserver.observe(list)

    return () => {
      observer.disconnect()
      resizeObserver.disconnect()
    }
  }, [updateIndicator])

  const isSlider = variant === "slider"

  return (
    <TabsPrimitive.List
      ref={listRef}
      data-slot="tabs-list"
      data-variant={variant}
      className={cn(tabsListVariants({ variant }), className)}
      {...props}
    >
      {isSlider && (
        <div
          aria-hidden
          className="absolute top-1.5 bottom-1.5 rounded-full bg-background shadow-sm transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] pointer-events-none z-0"
          style={indicatorStyle}
        />
      )}
      {isSlider
        ? React.Children.map(children, (child) =>
            React.isValidElement(child)
              ? React.cloneElement(child as React.ReactElement<Record<string, unknown>>, { className: cn("relative z-10", (child as React.ReactElement<{ className?: string }>).props.className) })
              : child
          )
        : children}
    </TabsPrimitive.List>
  )
}

function TabsTrigger({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        "relative inline-flex cursor-pointer items-center justify-center gap-1.5 whitespace-nowrap rounded-full border border-transparent px-3 py-1.5 max-sm:py-2.5 text-sm font-medium text-foreground/70 transition-all hover:text-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-1 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-50 has-data-[icon=inline-end]:pr-1 has-data-[icon=inline-start]:pl-1 dark:text-muted-foreground dark:hover:text-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 group-data-[variant=default]/tabs-list:hover:bg-background/60",
        "data-[state=active]:text-foreground data-[state=active]:shadow-none",
        "group-data-[variant=slider]/tabs-list:data-[state=active]:bg-transparent",
        "group-data-[variant=default]/tabs-list:data-[state=active]:bg-background group-data-[variant=default]/tabs-list:data-[state=active]:shadow-sm dark:group-data-[variant=default]/tabs-list:data-[state=active]:border-input dark:group-data-[variant=default]/tabs-list:data-[state=active]:bg-input/30",
        "group-data-[variant=line]/tabs-list:data-[state=active]:bg-background group-data-[variant=line]/tabs-list:data-[state=active]:shadow-sm dark:group-data-[variant=line]/tabs-list:data-[state=active]:border-input dark:group-data-[variant=line]/tabs-list:data-[state=active]:bg-input/30",
        className
      )}
      {...props}
    />
  )
}

function TabsContent({
  className,
  forceMount,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content> & {
  forceMount?: boolean;
}) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      forceMount={forceMount}
      className={cn(
        "text-sm outline-none",
        forceMount && "data-[state=inactive]:hidden",
        className
      )}
      {...props}
    />
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent, tabsListVariants }
