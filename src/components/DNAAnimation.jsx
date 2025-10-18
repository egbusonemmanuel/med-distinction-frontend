import React from "react";
import { motion } from "framer-motion";

const DNAAnimation = () => {
  const dots = Array.from({ length: 40 });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        background: "radial-gradient(ellipse at top, #001428, #000)",
        zIndex: -1,
      }}
    >
      {dots.map((_, i) => (
        <motion.div
          key={i}
          animate={{
            y: [0, -200, 0],
            x: [0, 30 * Math.sin(i), 0],
            opacity: [0.4, 1, 0.4],
          }}
          transition={{
            duration: 4 + Math.random() * 4,
            repeat: Infinity,
            delay: i * 0.1,
          }}
          style={{
            position: "absolute",
            width: "6px",
            height: "6px",
            borderRadius: "50%",
            background: `hsl(${200 + i * 3}, 70%, 60%)`,
            left: `${(i % 20) * 5}%`,
            bottom: `${Math.floor(i / 2) * 5}%`,
          }}
        />
      ))}
    </motion.div>
  );
};

export default DNAAnimation;
