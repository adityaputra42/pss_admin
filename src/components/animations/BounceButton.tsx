import { motion } from 'framer-motion';
import type { ButtonHTMLAttributes } from 'react';

// motion.button redefines onAnimationStart/onDrag* with its own signatures,
// which conflict with the native DOM ones in ButtonHTMLAttributes -- omit
// them (nobody was using drag/animation-event handlers on a plain button).
type Props = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'onAnimationStart' | 'onAnimationEnd' | 'onDrag' | 'onDragStart' | 'onDragEnd'
>;

/**
 * Drop-in <button> replacement with a bounce micro-interaction. Spreads
 * all standard button props (className, onClick, disabled, type, ...) so
 * it can replace a plain <button> without changing its styling classes.
 */
export default function BounceButton({ className, ...props }: Props) {
  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      whileHover={{ scale: props.disabled ? 1 : 1.03 }}
      className={className}
      {...props}
    />
  );
}
