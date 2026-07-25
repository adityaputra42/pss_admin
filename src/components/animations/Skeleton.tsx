import { motion } from "framer-motion";

type Props = {
  className?: string;
};

export default function Skeleton({ className = 'h-20 w-full' }: Props) {
  return (
    <div className="overflow-hidden rounded bg-gray-200">
      <motion.div
        className={`bg-gray-300 ${className}`}
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
