import { motion } from "framer-motion"
import { Sparkles } from "lucide-react"

function buildNarrative(metrics, params) {
  const { peak_size, final_size, reduction_percent } = metrics
  const { initial_size, growth_rate, chemo_strength, days } = params || {}

  let outcome = ""
  if (reduction_percent >= 90) {
    outcome = "The tumor was effectively eradicated — chemotherapy overwhelmed the growth rate."
  } else if (reduction_percent >= 50) {
    outcome = "The tumor was significantly reduced, indicating a strong partial response to treatment."
  } else if (reduction_percent >= 10) {
    outcome = "The tumor showed modest reduction. Increasing chemo strength may improve outcomes."
  } else {
    outcome = "The tumor continued to grow with minimal treatment effect. Consider higher dosage or combination therapy."
  }

  const peakDay = params ? Math.round(days * 0.3) : "~30"

  return [
    `The simulation ran for ${days ?? "—"} days starting from ${initial_size ?? "—"} tumor cells ` +
    `with a growth rate of r = ${growth_rate ?? "—"} and chemo strength c = ${chemo_strength ?? "—"}.`,
    `Peak tumor size reached ${peak_size.toFixed(0)} cells around day ${peakDay}, ` +
    `then fell to a final count of ${final_size.toFixed(0)} cells — a ${reduction_percent.toFixed(1)}% reduction.`,
    outcome,
  ]
}

export default function QuickSummaryCard({ metrics, params }) {
  if (!metrics) return null

  const sentences = buildNarrative(metrics, params)

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="rounded-2xl p-6"
      style={{
        background: "rgba(19,25,40,0.8)",
        border: "1px solid rgba(99,102,241,0.25)",
        boxShadow: "0 4px 24px rgba(0,0,0,0.4)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Glow */}
      <div
        className="absolute top-0 right-0 w-40 h-40 pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)",
          transform: "translate(20%, -20%)",
        }}
      />

      <div className="flex items-center gap-3 mb-4">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{
            background: "rgba(99,102,241,0.15)",
            border: "1px solid rgba(99,102,241,0.3)",
          }}
        >
          <Sparkles size={16} style={{ color: "#818cf8" }} />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-white">AI Summary</h2>
          <p className="text-xs" style={{ color: "#4a5568" }}>Auto-generated clinical narrative</p>
        </div>
      </div>

      <div className="space-y-2">
        {sentences.map((s, i) => (
          <motion.p
            key={i}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 * i + 0.2 }}
            className="text-sm leading-relaxed"
            style={{ color: i === 2 ? "#a5b4fc" : "#8892a4" }}
          >
            {i === 2 && (
              <span
                className="inline-block w-2 h-2 rounded-full mr-2 align-middle"
                style={{ background: "#818cf8" }}
              />
            )}
            {s}
          </motion.p>
        ))}
      </div>
    </motion.div>
  )
}
