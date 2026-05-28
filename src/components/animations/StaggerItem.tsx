import { motion } from "framer-motion";
import type{ ReactNode } from "react";

type Props = {
  children: ReactNode;
};

export default function StaggerItem({
  children,
}: Props) {
  return (
    <motion.div
      variants={{
        hidden: {
          opacity: 0,
          y: 20,
        },
        visible: {
          opacity: 1,
          y: 0,
        },
      }}
      transition={{
        duration: 0.3,
      }}
    >
      {children}
    </motion.div>
  );
}
