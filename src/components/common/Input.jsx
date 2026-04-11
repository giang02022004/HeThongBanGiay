import React from 'react';

const Input = ({ label, type = "text", value, onChange, placeholder, className = "", required = false, name, ...props }) => {
  return (
    <div className={`mb-6 ${className}`}>
      {label && (
        <label className="block text-gray-500 text-sm font-bold mb-3 ml-1 uppercase tracking-wider">
          {label}
        </label>
      )}
      <input
        type={type}
        value={value}
        onChange={onChange}
        name={name}
        placeholder={placeholder}
        required={required}
        {...props}
        className="w-full px-6 py-4 rounded-3xl bg-gray-50 border-2 border-transparent focus:bg-white focus:border-primary/20 focus:outline-none transition-all duration-300 text-gray-800 placeholder:text-gray-400 font-medium"
      />
    </div>
  );
};

export default Input;
