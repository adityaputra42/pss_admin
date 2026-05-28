// import { motion } from "framer-motion";
// import type { ReactNode } from "react";
// import { transition } from "../../utils/preset";

// type Props = {
//   children: ReactNode;
//   direction?: "up" | "down" | "left" | "right";
//   delay?: number;
//   className?: string;
// };

// export default function Slide({
//   children,
//   direction = "up",
//   delay = 0,
//   className = "",
// }: Props) {
//   const initial = {
//     opacity: 0,
//     x: 0,
//     y: 0,
//   };

//   switch (direction) {
//     case "up":
//       initial.y = 40;
//       break;

//     case "down":
//       initial.y = -40;
//       break;

//     case "left":
//       initial.x = 40;
//       break;

//     case "right":
//       initial.x = -40;
//       break;
//   }

//   return (
//     <motion.div
//       className={`flex min-h-screen h-full ${className}`}
//       initial={initial}
//       animate={{
//         opacity: 1,
//         x: 0,
//         y: 0,
//       }}
//       exit={initial}
//       transition={{
//         ...transition.normal,
//         delay,
//       }}
//     >
//       {children}
//     </motion.div>
//   );
// }


import { motion } from 'framer-motion';
import type{ ReactNode } from 'react';

type Props = {
  children: ReactNode;
  direction?: 'up' | 'down' | 'left' | 'right';
  delay?: number;
  duration?: number;
  className?: string;
};

export default function Slide({
  children,
  direction = 'up',
  delay = 0,
  duration = 0.3,
  className = '',
}: Props) {
  const initial = {
    opacity: 0,
    x: 0,
    y: 0,
  };

  switch (direction) {
    case 'up':
      initial.y = 30;
      break;

    case 'down':
      initial.y = -30;
      break;

    case 'left':
      initial.x = 30;
      break;

    case 'right':
      initial.x = -30;
      break;
  }

  return (
    <motion.div
      className={className}
      initial={initial}
      animate={{
        opacity: 1,
        x: 0,
        y: 0,
      }}
      exit={initial}
      transition={{
        duration,
        delay,
      }}
    >
      {children}
    </motion.div>
  );
}
