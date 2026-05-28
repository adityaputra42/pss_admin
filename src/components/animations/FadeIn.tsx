import { motion } from "framer-motion";
import { fadeIn } from "../../utils/motion";
import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  duration?: number;
};

export default function FadeIn({
  children,
  duration = 0.3,
}: Props) {
  return (
    <motion.div
      variants={fadeIn}
      initial="hidden"
      animate="visible"
      transition={{ duration }}
    >
      {children}
    </motion.div>
  );
}
