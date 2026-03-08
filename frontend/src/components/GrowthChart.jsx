import {
  XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer,
  Area, AreaChart, ReferenceLine, Legend,
} from "recharts"
import { motion } from "framer-motion"
import { BarChart2, GitCompare } from "lucide-react"

function CustomTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    return (
      <div
        className="rounded-xl px-4 py-3 text-sm"
        style={{
          background: "rgba(19,25,40,0.95)",
          border: "1px solid var(--accent-border-hi)",
          boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
        }}
      >
        <p style={{ color: "#8892a4" }} className="text-xs mb-1">Day {label}</p>
        {payload.map((entry) => (
          <p key={entry.name} className="font-mono font-semibold" style={{ color: entry.color }}>
            {Number(entry.value).toFixed(2)}{" "}
            <span className="text-xs font-normal" style={{ color: "#4a5568" }}>
              cells ({entry.name})
            </span>
          </p>
        ))}
      </div>
    )
  }
  return null
}

export default function GrowthChart({ data, compareData = undefined }) {
  if (!data) return null

  const primaryCurve = data.curve
  const compareCurve = compareData?.curve ?? undefined

  const maxLen = Math.max(primaryCurve.length, compareCurve ? compareCurve.length : 0)
  const chartData = Array.from({ length: maxLen }, (_, i) => ({
    day: i,
    "Run A": primaryCurve[i] != null ? parseFloat(primaryCurve[i].toFixed(2)) : null,
    ...(compareCurve ? { "Run B": compareCurve[i] != null ? parseFloat(compareCurve[i].toFixed(2)) : null } : {}),
  }))

  const peakA = Math.max(...primaryCurve)
  const peakB = compareCurve ? Math.max(...compareCurve) : null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.15 }}
      className="rounded-2xl p-6"
      style={{
        background: "rgba(19,25,40,0.8)",
        border: "1px solid rgba(30,42,58,0.8)",
        boxShadow: "0 4px 24px rgba(0,0,0,0.4)",
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: "var(--accent-soft)", border: "1px solid var(--accent-border)" }}
          >
            {compareData ? (
              <GitCompare size={16} style={{ color: "var(--accent)" }} />
            ) : (
              <BarChart2 size={16} style={{ color: "var(--accent)" }} />
            )}
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white">
              {compareData ? "Comparative Growth Curves" : "Tumor Growth Curve"}
            </h2>
            <p className="text-xs" style={{ color: "#4a5568" }}>
              {chartData.length} data points{compareData ? " · 2 runs overlaid" : ""}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono"
            style={{ background: "var(--accent-soft)", border: "1px solid var(--accent-border)", color: "var(--accent-light)" }}
          >
            <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: "var(--accent)" }} />
            A: {peakA.toFixed(0)}
          </div>
          {peakB != null && (
            <div
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono"
              style={{ background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.2)", color: "#60a5fa" }}
            >
              <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: "#3b82f6" }} />
              B: {peakB.toFixed(0)}
            </div>
          )}
        </div>
      </div>

      {/* Chart — uses CSS var for line colors */}
      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={chartData} margin={{ top: 8, right: 16, bottom: 8, left: 8 }}>
          <defs>
            {/* Primary gradient */}
            <linearGradient id="gradA" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="var(--chart-line)" stopOpacity={0.4} />
              <stop offset="95%" stopColor="var(--chart-line)" stopOpacity={0.02} />
            </linearGradient>
            {/* Compare gradient */}
            <linearGradient id="gradB" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.02} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" stroke="rgba(30,42,58,0.7)" vertical={false} />
          <XAxis
            dataKey="day"
            tick={{ fill: "#4a5568", fontSize: 11, fontFamily: "Inter" }}
            axisLine={{ stroke: "rgba(30,42,58,0.8)" }}
            tickLine={false}
            label={{ value: "Day", position: "insideBottomRight", offset: -4, fill: "#4a5568", fontSize: 11 }}
          />
          <YAxis
            tick={{ fill: "#4a5568", fontSize: 11, fontFamily: "Inter" }}
            axisLine={false}
            tickLine={false}
            width={60}
            label={{ value: "Tumor Size", angle: -90, position: "insideLeft", offset: 8, fill: "#4a5568", fontSize: 11 }}
          />
          <Tooltip content={<CustomTooltip />} />
          {compareData && <Legend wrapperStyle={{ color: "#8892a4", fontSize: 11 }} />}

          <ReferenceLine y={peakA} stroke="var(--accent-border-hi)" strokeDasharray="4 4" />
          {peakB != null && (
            <ReferenceLine y={peakB} stroke="rgba(59,130,246,0.25)" strokeDasharray="4 4" />
          )}

          <Area
            type="monotone"
            dataKey="Run A"
            stroke="var(--chart-line)"
            strokeWidth={2.5}
            fill="url(#gradA)"
            dot={false}
            activeDot={{ r: 5, fill: "var(--chart-line)", strokeWidth: 2 }}
            isAnimationActive
            animationDuration={1200}
            animationEasing="ease-out"
            connectNulls
          />
          {compareData && (
            <Area
              type="monotone"
              dataKey="Run B"
              stroke="#3b82f6"
              strokeWidth={2.5}
              fill="url(#gradB)"
              dot={false}
              activeDot={{ r: 5, fill: "#3b82f6", stroke: "#60a5fa", strokeWidth: 2 }}
              isAnimationActive
              animationDuration={1200}
              animationEasing="ease-out"
              connectNulls
            />
          )}
        </AreaChart>
      </ResponsiveContainer>
    </motion.div>
  )
}