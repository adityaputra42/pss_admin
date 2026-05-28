import { motion } from "framer-motion";
import type{ ReactNode } from "react";

type Props = {
  children: ReactNode;
};

export default function Floating({
  children,
}: Props) {
  return (
    <motion.div
      animate={{
        y: [0, -10, 0],
      }}
      transition={{
        repeat: Infinity,
        duration: 2,
      }}
    >
      {children}
    </motion.div>
  );
}
