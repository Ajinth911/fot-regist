export const FOT_EASING = [0.22, 1, 0.36, 1] as const;

export const transitionFast = {
  duration: 0.25,
  ease: FOT_EASING,
};

export const transitionMedium = {
  duration: 0.55,
  ease: FOT_EASING,
};

export const transitionSlow = {
  duration: 0.85,
  ease: FOT_EASING,
};

export const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

export const fadeSlideUp = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: transitionMedium,
  },
};

export const maskedLineReveal = {
  hidden: { y: '105%', opacity: 0 },
  visible: {
    y: '0%',
    opacity: 1,
    transition: {
      duration: 0.8,
      ease: FOT_EASING,
    },
  },
};

export const hairlineDraw = {
  hidden: { scaleX: 0, transformOrigin: 'left' },
  visible: {
    scaleX: 1,
    transition: {
      duration: 0.9,
      ease: FOT_EASING,
    },
  },
};
