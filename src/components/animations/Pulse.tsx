import { motion } from "framer-motion";

export default function Pulse() {
  return (
    <motion.div
      className="w-3 h-3 rounded-full bg-green-500"
      animate={{
        scale: [1, 1.4, 1],
        opacity: [1, 0.5, 1],
      }}
      transition={{
        repeat: Infinity,
        duration: 1.2,
      }}
    />
  );
}
