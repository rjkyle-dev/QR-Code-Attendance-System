'use client';

import { cn } from '@/lib/utils';
import { HTMLMotionProps, motion, type Transition } from 'motion/react';

type GradientBackgroundProps = HTMLMotionProps<'div'> & {
  transition?: Transition;
};

function GradientBackground({
  className,
  transition = { duration: 10, ease: 'easeInOut', repeat: Infinity },
  ...props
}: GradientBackgroundProps) {
  return (
    <motion.div
      data-slot="gradient-background"
      className={cn(
        'size-full bg-gradient-to-r from-cfar-400 from-0% via-50% via-cfar-500 to-cfar-600 to-100% bg-[length:300%_300%]',
        className,
      )}
      animate={{
        backgroundPosition: ['0% 0%', '50% 50%', '100% 0%', '50% 100%', '0% 50%', '100% 100%', '0% 0%'],
        // backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
      }}
      whileTap={{
        scale: 1.98,
      }}
      transition={transition}
      {...props}
    />
  );
}

export { GradientBackground, type GradientBackgroundProps };
