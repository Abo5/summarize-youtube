"use client"

import React, { createContext, useContext, forwardRef } from "react"
import * as RechartsPrimitive from "recharts"
import { cn } from "@/lib/utils"

/**
 * THEMES عبارة عن كائن لتحديد شكل الألوان في النمط الفاتح والداكن.
 * يمكنك التعديل حسب الحاجة أو حسب سياقك.
 */
const THEMES = { light: "", dark: ".dark" }

/**
 * في الأصل كان هناك type ChartConfig في تايبسكريبت.
 * نستعيض عنه الآن بمجرد تعليق أو Object عادي.
 * يمثل: { [key: string]: { label?: React.ReactNode; icon?: React.ComponentType; color?: string; theme?: Record<string, string> } }
 */

/** سياق الرسم البياني */
const ChartContext = createContext(null)

/** hook للحصول على config من السياق */
function useChart() {
  const context = useContext(ChartContext)
  if (!context) {
    throw new Error("useChart must be used within a <ChartContainer />")
  }
  return context
}

/**
 * ChartContainer
 * مكوّن أساسي يحتوي على Recharts ResponsiveContainer ويحوي config للألوان والإعدادات.
 */
export const ChartContainer = forwardRef(function ChartContainer(
  { id, className, children, config, ...props },
  ref
) {
  const uniqueId = React.useId()
  const chartId = `chart-${id || uniqueId.replace(/:/g, "")}`

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        data-chart={chartId}
        ref={ref}
        className={cn(
          "flex aspect-video justify-center text-xs",
          "[&_svg]:overflow-visible [&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground",
          "[&_svg_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-border/50",
          "[&_svg_.recharts-curve.recharts-tooltip-cursor]:stroke-border",
          "[&_svg_.recharts-dot[stroke='#fff']]:stroke-transparent",
          "[&_svg_.recharts-layer]:outline-none [&_.recharts-polar-grid_[stroke='#ccc']]:stroke-border",
          "[&_svg_.recharts-radial-bar-background-sector]:fill-muted",
          "[&_svg_.recharts-rectangle.recharts-tooltip-cursor]:fill-muted",
          "[&_svg_.recharts-reference-line_[stroke='#ccc']]:stroke-border",
          "[&_svg_.recharts-sector[stroke='#fff']]:stroke-transparent [&_.recharts-sector]:outline-none [&_.recharts-surface]:outline-none",
          className
        )}
        {...props}
      >
        <ChartStyle id={chartId} config={config} />
        <RechartsPrimitive.ResponsiveContainer>{children}</RechartsPrimitive.ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  )
})

/**
 * يضيف ستايلات ديناميكية للألوان بناء على config لكل تمبليت.
 */
export function ChartStyle({ id, config }) {
  if (!config) return null

  // استخرج المفاتيح التي تحتوي على color/theme
  const colorConfig = Object.entries(config).filter(([_, val]) => val.theme || val.color)

  if (!colorConfig.length) {
    return null
  }

  // نبني أسلوب (CSS) لكلا النمطين light & dark
  return (
    <style
      dangerouslySetInnerHTML={{
        __html: Object.entries(THEMES)
          .map(([theme, prefix]) => {
            return `
${prefix} [data-chart=${id}] {
${colorConfig
  .map(([key, itemConfig]) => {
    const color = itemConfig.theme?.[theme] || itemConfig.color
    return color ? `  --color-${key}: ${color};` : null
  })
  .filter(Boolean)
  .join("\n")}
}
`
          })
          .join("\n"),
      }}
    />
  )
}

/**
 * مجرد ربطات مختصرة لـ Recharts Tooltip, Legend, إلخ.
 */
export const ChartTooltip = RechartsPrimitive.Tooltip

export const ChartTooltipContent = forwardRef(function ChartTooltipContent(
  {
    active,
    payload,
    className,
    indicator = "dot",
    hideLabel = false,
    hideIndicator = false,
    label,
    labelFormatter,
    labelClassName,
    formatter,
    color,
    nameKey,
    labelKey,
    ...props
  },
  ref
) {
  const { config } = useChart()

  const tooltipLabel = React.useMemo(() => {
    if (hideLabel || !payload?.length) {
      return null
    }
    const item = payload[0]
    if (!item) return null

    const valueKey = labelKey || item.dataKey || item.name || "value"
    const itemConfig = getPayloadConfigFromPayload(config, item, valueKey)
    const finalLabel = !labelKey && typeof label === "string" ? config[label]?.label || label : itemConfig?.label

    if (labelFormatter) {
      return <div className={cn("font-medium", labelClassName)}>{labelFormatter(finalLabel, payload)}</div>
    }
    if (!finalLabel) return null

    return <div className={cn("font-medium", labelClassName)}>{finalLabel}</div>
  }, [label, labelFormatter, payload, hideLabel, labelClassName, config, labelKey])

  if (!active || !payload?.length) {
    return null
  }

  const nestLabel = payload.length === 1 && indicator !== "dot"

  return (
    <div
      ref={ref}
      className={cn(
        "grid min-w-[8rem] items-start gap-1.5 rounded-lg border border-border/50 bg-background px-2.5 py-1.5 text-xs shadow-xl",
        className
      )}
      {...props}
    >
      {!nestLabel ? tooltipLabel : null}
      <div className="grid gap-1.5">
        {payload.map((item, index) => {
          const key = nameKey || item.name || item.dataKey || "value"
          const itemConfig = getPayloadConfigFromPayload(config, item, key)
          const indicatorColor = color || item.payload?.fill || item.color

          return (
            <div
              key={item.dataKey}
              className={cn(
                "flex w-full flex-wrap items-stretch gap-2 [&>svg]:h-2.5 [&>svg]:w-2.5 [&>svg]:text-muted-foreground",
                indicator === "dot" && "items-center"
              )}
            >
              {formatter && item.value !== undefined && item.name ? (
                formatter(item.value, item.name, item, index, item.payload)
              ) : (
                <>
                  {!hideIndicator && !itemConfig?.icon && indicator === "dot" && (
                    <div
                      className="shrink-0 h-2.5 w-2.5 rounded-[2px] bg-[--color-bg]"
                      style={{
                        "--color-bg": indicatorColor,
                      }}
                    />
                  )}
                  {!hideIndicator && !itemConfig?.icon && indicator === "line" && (
                    <div
                      className="shrink-0 w-1 rounded-[2px] bg-[--color-bg]"
                      style={{ "--color-bg": indicatorColor }}
                    />
                  )}
                  {!hideIndicator && !itemConfig?.icon && indicator === "dashed" && (
                    <div
                      className="shrink-0 w-0 border-[1.5px] border-dashed bg-transparent"
                      style={{ borderColor: indicatorColor }}
                    />
                  )}
                  {itemConfig?.icon && React.createElement(itemConfig.icon, null)}

                  <div className={cn("flex flex-1 justify-between leading-none", nestLabel ? "items-end" : "items-center")}>
                    <div className="grid gap-1.5">
                      {nestLabel ? tooltipLabel : null}
                      <span className="text-muted-foreground">{itemConfig?.label || item.name}</span>
                    </div>
                    {item.value !== undefined && (
                      <span className="font-mono font-medium tabular-nums text-foreground">
                        {item.value.toLocaleString()}
                      </span>
                    )}
                  </div>
                </>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
})

ChartTooltipContent.displayName = "ChartTooltipContent"

export const ChartLegend = RechartsPrimitive.Legend

export const ChartLegendContent = forwardRef(function ChartLegendContent(
  { className, hideIcon = false, payload, verticalAlign = "bottom", nameKey },
  ref
) {
  const { config } = useChart()

  if (!payload?.length) {
    return null
  }

  return (
    <div
      ref={ref}
      className={cn("flex items-center justify-center gap-4", verticalAlign === "top" ? "pb-3" : "pt-3", className)}
    >
      {payload.map((item) => {
        const key = nameKey || item.dataKey || "value"
        const itemConfig = getPayloadConfigFromPayload(config, item, key)

        return (
          <div
            key={item.value}
            className="flex items-center gap-1.5 [&>svg]:h-3 [&>svg]:w-3 [&>svg]:text-muted-foreground"
          >
            {!hideIcon && !itemConfig?.icon ? (
              <div className="h-2 w-2 shrink-0 rounded-[2px]" style={{ backgroundColor: item.color }} />
            ) : null}
            {itemConfig?.icon && React.createElement(itemConfig.icon, null)}

            {itemConfig?.label || item.value}
          </div>
        )
      })}
    </div>
  )
})
ChartLegendContent.displayName = "ChartLegendContent"

function getPayloadConfigFromPayload(config, payload, key) {
  if (typeof payload !== "object" || payload === null) {
    return undefined
  }
  const p = payload.payload && typeof payload.payload === "object" ? payload.payload : undefined

  let configLabelKey = key

  if (key in payload && typeof payload[key] === "string") {
    configLabelKey = payload[key]
  } else if (p && key in p && typeof p[key] === "string") {
    configLabelKey = p[key]
  }

  if (configLabelKey in config) {
    return config[configLabelKey]
  }
  return config[key]
}
