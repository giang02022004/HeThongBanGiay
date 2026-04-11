import React from 'react';
import { motion } from 'framer-motion';

const Button = ({ children, onClick, type = "button", variant = "primary", className = "", disabled = false }) => {
  const variants = {
    primary: "bg-primary text-white shadow-blue-100",
    secondary: "bg-secondary text-white shadow-purple-100",
    success: "bg-success text-white shadow-green-100",
    danger: "bg-danger text-white shadow-red-100",
    warning: "bg-warning text-white shadow-orange-100",
    outline: "bg-white text-gray-700 border-2 border-gray-100 hover:border-primary/30 shadow-none",
    ghost: "bg-transparent text-gray-500 hover:bg-gray-100 shadow-none",
  };

  return (
    <motion.button
      whileHover={disabled ? {} : { y: -2 }}
      whileTap={disabled ? {} : { scale: 0.98 }}
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300
        flex items-center justify-center gap-2 shadow-xl
        disabled:opacity-40 disabled:cursor-not-allowed
        ${variants[variant] || variants.primary}
        ${className}
      `}
    >
      {children}
    </motion.button>
  );
};

export default Button;
