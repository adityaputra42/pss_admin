import { motion } from "framer-motion";
import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
};

export default function ScaleIn({ children }: Props) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        scale: 0.8,
      }}
      animate={{
        opacity: 1,
        scale: 1,
      }}
      exit={{
        opacity: 0,
        scale: 0.8,
      }}
      transition={{
        duration: 0.2,
      }}
    >
      {children}
    </motion.div>
  );
}
