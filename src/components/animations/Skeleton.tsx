import { motion } from "framer-motion";

export default function Skeleton() {
  return (
    <div className="overflow-hidden rounded-xl bg-gray-200">
      <motion.div
        className="h-20 w-full bg-gray-300"
        animate={{
          x: ["-100%", "100%"],
        }}
        transition={{
          repeat: Infinity,
          duration: 1.2,
        }}
      />
    </div>
  );
}
