import React from 'react';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'ghost';
};

export default function Button({ variant = 'primary', className = '', ...props }: ButtonProps) {
  const base = 'px-3 py-1.5 rounded-md font-medium focus:outline-none focus:ring-2';
  const variants: Record<string, string> = {
    primary: 'bg-sky-500 text-white hover:bg-sky-600 focus:ring-sky-300',
    ghost: 'bg-transparent text-slate-700 hover:bg-slate-100 dark:text-slate-200'
  };
  return <button className={`${base} ${variants[variant]} ${className}`} {...props} />;
}
