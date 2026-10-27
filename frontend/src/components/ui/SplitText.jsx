import React from 'react';
import { motion } from 'framer-motion';

export default function SplitText({
  children,
  className = '',
  delay = 0,
  stagger = 0.04,
  mode = 'word', // 'word' | 'char'
}) {
  const text = typeof children === 'string' ? children : '';

  if (mode === 'word') {
    const words = text.split(' ');
    return (
      <span className={`inline-flex flex-wrap gap-x-2 gap-y-1 ${className}`}>
        {words.map((word, i) => (
          <span key={i} className="inline-block overflow-hidden py-1">
            <motion.span
              className="inline-block"
              initial={{ y: '110%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{
                duration: 0.75,
                delay: delay + i * stagger,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              {word}
            </motion.span>
          </span>
        ))}
      </span>
    );
  }

  // Character mode
  const characters = text.split('');
  return (
    <span className={`inline-block ${className}`}>
      {characters.map((char, i) => (
        <span key={i} className="inline-block overflow-hidden">
          <motion.span
            className="inline-block"
            initial={{ y: '120%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{
              duration: 0.6,
              delay: delay + i * stagger,
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            {char === ' ' ? '\u00A0' : char}
          </motion.span>
        </span>
      ))}
    </span>
  );
}
