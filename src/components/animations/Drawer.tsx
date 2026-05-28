import { motion } from "framer-motion";
import type{ ReactNode } from "react";

type Props = {
  children: ReactNode;
};

export default function Drawer({
  children,
}: Props) {
  return (
    <motion.div
      initial={{
        x: "100%",
      }}
      animate={{
        x: 0,
      }}
      exit={{
        x: "100%",
      }}
      transition={{
        type: "spring",
        stiffness: 260,
        damping: 20,
      }}
      className="
        fixed
        right-0
        top-0
        h-screen
        w-80
        bg-white
        shadow-2xl
      "
    >
      {children}
    </motion.div>
  );
}
