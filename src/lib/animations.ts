// src/lib/animations.ts
import type { Variants } from "framer-motion";

// Fade in and slide up (e.g., for titles/headings)
export const titleVariants: Variants = {
  hidden: { y: -20, opacity: 0 },
  show: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring" as const,
      stiffness: 100,
    },
  },
};

// Container fade with staggered children
export const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

// Item fade in with upward slide (for list/grid items)
export const itemVariants: Variants = {
  hidden: { y: 20, opacity: 0 },
  show: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring" as const,
      stiffness: 100,
      damping: 10,
    },
  },
};

  export const cardVariants: Variants = {
    hidden: { scale: 0.95, opacity: 0 },
    show: {
      scale: 1,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 15
      }
    }
  };

 export const hoverVariants: Variants = {
    hover: { scale: 1.02 },
    tap: { scale: 0.98 }
  };
 export const buttonVariants: Variants = {
    hover: { scale: 1.05 },
    tap: { scale: 0.95 }
  };

 export const statusVariants: Variants = {
    initial: { scale: 0.9, opacity: 0 },
    animate: { 
      scale: 1, 
      opacity: 1,
      transition: { 
        type: "spring",
        stiffness: 300
      }
    }
  };
 export const underlineVariants: Variants = {
    hidden: { width: 0 },
    show: { width: "100%" }
  };