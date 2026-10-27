import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export default function Input({
  label,
  type = 'text',
  value,
  onChange,
  placeholder = ' ',
  error,
  helperText,
  icon: Icon,
  variant = 'underline', // 'underline' | 'pill' | 'default'
  className = '',
  required = false,
  ...props
}) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

  if (variant === 'underline') {
    return (
      <div className={`w-full ${className}`}>
        {label && (
          <label className="block text-xs font-semibold text-[#475569] mb-1.5 tracking-tight">
            {label} {required && <span className="text-rose-500">*</span>}
          </label>
        )}
        <div className="relative flex items-center border-b border-black/15 focus-within:border-[#0B0B0F] pb-2 transition-colors">
          {Icon && (
            <Icon className="w-4 h-4 text-[#94A3B8] mr-2.5 flex-shrink-0" />
          )}
          <input
            type={inputType}
            value={value}
            onChange={onChange}
            placeholder={placeholder === ' ' ? '' : placeholder}
            required={required}
            className="w-full bg-transparent text-sm font-medium text-[#0B0B0F] focus:outline-none placeholder:text-[#94A3B8]"
            {...props}
          />
          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-[#94A3B8] hover:text-[#0B0B0F] transition-colors p-1 flex-shrink-0 ml-1"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          )}
        </div>
        {error && <p className="text-xs text-rose-500 mt-1 font-medium">{error}</p>}
        {helperText && !error && (
          <p className="text-xs text-[#94A3B8] mt-1">{helperText}</p>
        )}
      </div>
    );
  }

  // Pill variant
  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label className="block text-xs font-semibold text-[#475569] mb-1.5 uppercase tracking-wider">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}
      <div className="relative flex items-center">
        {Icon && (
          <Icon className="w-4 h-4 text-[#94A3B8] absolute left-4 pointer-events-none" />
        )}
        <input
          type={inputType}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className={`w-full rounded-full bg-white/80 border border-black/10 px-4 py-2.5 text-sm text-[#0B0B0F] placeholder:text-[#94A3B8] focus:border-[#0B0B0F] focus:outline-none focus:ring-1 focus:ring-black/10 transition-all ${
            Icon ? 'pl-11' : ''
          } ${isPassword ? 'pr-11' : ''}`}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 text-[#94A3B8] hover:text-[#0B0B0F] transition-colors"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        )}
      </div>
      {error && <p className="text-xs text-rose-500 mt-1.5 font-medium">{error}</p>}
      {helperText && !error && (
        <p className="text-xs text-[#94A3B8] mt-1">{helperText}</p>
      )}
    </div>
  );
}
