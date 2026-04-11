import React from 'react';
import { motion } from 'framer-motion';

const Card = ({ children, className = "", hover = true }) => {
  return (
    <motion.div
      whileHover={hover ? { y: -4 } : {}}
      className={`bg-white p-8 rounded-[2.5rem] shadow-2xl shadow-gray-200/50 border border-gray-100 transition-all ${className}`}
    >
      {children}
    </motion.div>
  );
};

export default Card;
