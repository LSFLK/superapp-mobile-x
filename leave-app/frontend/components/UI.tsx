
import React from 'react';
import { cn } from '../utils/cn';
import { Loader2, X } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  className, variant = 'primary', size = 'md', isLoading, children, ...props 
}) => {
  const baseStyles = "inline-flex items-center justify-center rounded-xl font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:pointer-events-none active:scale-95";
  
  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2.5 text-sm",
    lg: "px-6 py-3 text-base"
  };

  const variants = {
    primary: "bg-primary-600 text-white hover:bg-primary-700 shadow-sm shadow-primary-500/30 border border-transparent",
    secondary: "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 shadow-sm",
    danger: "bg-red-50 text-red-600 border border-red-100 hover:bg-red-100",
    ghost: "text-slate-600 hover:bg-slate-100 hover:text-slate-900 bg-transparent",
    outline: "border border-primary-600 text-primary-600 hover:bg-primary-50"
  };

  return (
    <button className={cn(baseStyles, sizes[size], variants[variant], className)} {...props}>
      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
};

export const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <div className={cn("bg-white rounded-2xl border border-slate-100 shadow-sm p-4", className)}>
    {children}
  </div>
);

export const Badge: React.FC<{ status: string }> = ({ status }) => {
  const styles: Record<string, string> = {
    approved: "bg-emerald-100 text-emerald-700 border-emerald-200",
    pending: "bg-amber-100 text-amber-700 border-amber-200",
    rejected: "bg-red-100 text-red-700 border-red-200",
    sick: "bg-rose-50 text-rose-600 border-rose-100",
    annual: "bg-sky-50 text-sky-600 border-sky-100",
    casual: "bg-indigo-50 text-indigo-600 border-indigo-100"
  };

  const fallback = "bg-slate-100 text-slate-600 border-slate-200";

  return (
    <span className={cn("px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold border tracking-wide", styles[status] || fallback)}>
      {status}
    </span>
  );
};

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => {
    return (
      <input
        className={cn(
          "flex h-9 w-full rounded-lg border border-slate-200 bg-white px-3 py-1 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 disabled:cursor-not-allowed disabled:opacity-50 transition-all",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export const Select = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, ...props }, ref) => {
    return (
      <div className="relative w-full">
        <select
          className={cn(
            "flex h-9 w-full appearance-none rounded-lg border border-slate-200 bg-white px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 disabled:cursor-not-allowed disabled:opacity-50 transition-all pr-8",
            className
          )}
          ref={ref}
          {...props}
        />
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
          <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
            <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
          </svg>
        </div>
      </div>
    );
  }
);
Select.displayName = "Select";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center p-4 border-b border-slate-100">
          <h3 className="font-semibold text-slate-800">{title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={20} />
          </button>
        </div>
        <div className="p-4">
          {children}
        </div>
      </div>
    </div>
  );
};