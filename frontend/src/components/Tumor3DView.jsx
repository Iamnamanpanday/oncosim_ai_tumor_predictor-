import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls, Stars, Environment } from "@react-three/drei"
import { useState, useRef, useEffect, useMemo } from "react"
import { motion } from "framer-motion"
import { RotateCcw, Box } from "lucide-react"
import * as THREE from "three"

function TumorSphere({ curve }) {
  const meshRef = useRef()
  const glowRef = useRef()
  const [day, setDay] = useState(0)

  useEffect(() => {
    setDay(0)
    const interval = setInterval(() => {
      setDay((prev) => {
        if (prev >= curve.length - 1) {
          clearInterval(interval)
          return prev
        }
        return prev + 1
      })
    }, 40)
    return () => clearInterval(interval)
  }, [curve])

  const targetScale = useMemo(() => {
    const size = curve[day] ?? 0
    return Math.max(size / 800, 0.15)
  }, [curve, day])

  useFrame((state) => {
    if (!meshRef.current) return
    const t = state.clock.getElapsedTime()

    // Smooth scale lerp
    const current = meshRef.current.scale.x
    const next = THREE.MathUtils.lerp(current, targetScale, 0.06)
    meshRef.current.scale.setScalar(next)

    // Slow auto-rotation
    meshRef.current.rotation.y += 0.005
    meshRef.current.rotation.x = Math.sin(t * 0.3) * 0.08

    // Glow sphere
    if (glowRef.current) {
      glowRef.current.scale.setScalar(next * 1.25)
      glowRef.current.material.opacity = 0.12 + Math.sin(t * 1.5) * 0.05
    }
  })

  return (
    <group>
      {/* Core tumor sphere */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[1, 64, 64]} />
        <meshStandardMaterial
          color="#dc143c"
          emissive="#8b0000"
          emissiveIntensity={0.6}
          roughness={0.4}
          metalness={0.1}
        />
      </mesh>

      {/* Glow outer sphere */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshStandardMaterial
          color="#ff1a3c"
          transparent
          opacity={0.15}
          side={THREE.BackSide}
          depthWrite={false}
        />
      </mesh>

      {/* Point light from tumor */}
      <pointLight color="#dc143c" intensity={2} distance={6} />
    </group>
  )
}

export default function Tumor3DView({ data }) {
  if (!data) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.25 }}
      className="rounded-2xl overflow-hidden"
      style={{
        background: "rgba(8,11,18,0.95)",
        border: "1px solid rgba(220,20,60,0.2)",
        boxShadow: "0 4px 24px rgba(0,0,0,0.6), inset 0 0 60px rgba(220,20,60,0.04)",
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-6 py-4"
        style={{ borderBottom: "1px solid rgba(30,42,58,0.8)" }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: "rgba(220,20,60,0.15)", border: "1px solid rgba(220,20,60,0.3)" }}
          >
            <Box size={16} style={{ color: "#dc143c" }} />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white">3D Tumor Visualization</h2>
            <p className="text-xs" style={{ color: "#4a5568" }}>Drag to rotate · Scroll to zoom</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-xs" style={{ color: "#4a5568" }}>
          <RotateCcw size={12} />
          <span>OrbitControls active</span>
        </div>
      </div>

      {/* Canvas */}
      <div style={{ height: 340 }}>
        <Canvas
          camera={{ position: [3, 2, 4], fov: 50 }}
          gl={{ antialias: true, alpha: false }}
          style={{ background: "transparent" }}
        >
          <color attach="background" args={["#060810"]} />
          <fog attach="fog" args={["#060810", 8, 20]} />

          {/* Stars background */}
          <Stars radius={60} depth={50} count={3000} factor={3} saturation={0} fade speed={0.5} />

          {/* Lighting */}
          <ambientLight intensity={0.3} />
          <directionalLight position={[5, 5, 5]} intensity={0.7} color="#fff5f5" />
          <directionalLight position={[-3, -2, -3]} intensity={0.2} color="#8b0000" />

          {/* Tumor */}
          <TumorSphere curve={data.curve} />

          <OrbitControls
            enablePan={false}
            minDistance={2}
            maxDistance={12}
            autoRotate={false}
          />
        </Canvas>
      </div>
    </motion.div>
  )
}