import * as React from "react";
import { createPortal } from "react-dom";
import { cn } from "../../lib/utils";
import { X } from "lucide-react";

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

export const Dialog = ({ open, onOpenChange, children }: DialogProps) => {
  React.useEffect(() => {
    if (open) {
      // Store current scroll position
      const scrollY = window.scrollY;
      // Lock body scroll
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';
      
      return () => {
        // Restore scroll position
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        document.body.style.overflow = '';
        window.scrollTo(0, scrollY);
      };
    }
  }, [open]);

  if (!open) return null;

  const dialogContent = (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
    >
      <div
        className="fixed inset-0 bg-black/60"
        onClick={() => onOpenChange(false)}
      />
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );

  return createPortal(dialogContent, document.body);
};

interface DialogContentProps {
  children: React.ReactNode;
  className?: string;
  onClose: () => void;
}

export const DialogContent = ({ children, className, onClose }: DialogContentProps) => {
  return (
    <div
      className={cn(
        "relative bg-white w-full max-w-lg",
        "rounded-2xl shadow-2xl",
        "max-h-[80vh] flex flex-col",
        className
      )}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Close button - always visible at top */}
      <div className="flex justify-end p-3 border-b border-slate-100 shrink-0">
        <button
          onClick={onClose}
          className="rounded-full p-2 bg-slate-200 hover:bg-slate-300 active:bg-slate-400 transition-colors shadow-md"
          aria-label="Close"
        >
          <X className="h-5 w-5 text-slate-900 stroke-[2.5]" />
        </button>
      </div>
      
      {/* Scrollable content */}
      <div className="overflow-y-auto flex-1">
        {children}
      </div>
    </div>
  );
};

interface DialogHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export const DialogHeader = ({ children, className }: DialogHeaderProps) => {
  return (
    <div className={cn("px-4 sm:px-6 pt-3 pb-3 sm:pb-4 border-b border-slate-200", className)}>
      {children}
    </div>
  );
};

interface DialogTitleProps {
  children: React.ReactNode;
  className?: string;
}

export const DialogTitle = ({ children, className }: DialogTitleProps) => {
  return (
    <h2 className={cn("text-lg sm:text-xl font-bold text-slate-900 pr-10 sm:pr-12", className)}>
      {children}
    </h2>
  );
};

interface DialogBodyProps {
  children: React.ReactNode;
  className?: string;
}

export const DialogBody = ({ children, className }: DialogBodyProps) => {
  return (
    <div className={cn("px-4 sm:px-6 py-4 overflow-y-auto flex-1", className)}>
      {children}
    </div>
  );
};
