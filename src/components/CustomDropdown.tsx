import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, Check } from 'lucide-react';

export interface DropdownOption {
  value: string | number;
  label: string;
  indent?: boolean;
  disabled?: boolean;
}

interface CustomDropdownProps {
  value: string | number;
  options: DropdownOption[];
  onChange: (value: any) => void;
  placeholder?: string;
  className?: string;
  buttonClassName?: string;
  menuClassName?: string;
  fontMono?: boolean;
  icon?: React.ReactNode;
  uiAnimations?: boolean;
  uiAnimSpeed?: number;
}

export const CustomDropdown: React.FC<CustomDropdownProps> = ({
  value,
  options,
  onChange,
  placeholder = 'Select...',
  className = '',
  buttonClassName = '',
  menuClassName = '',
  fontMono = false,
  icon,
  uiAnimations = true,
  uiAnimSpeed = 1,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => String(opt.value) === String(value));

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div className={`relative inline-block w-full text-left ${className}`} ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full dual-kawase-glass-subtle hover:bg-slate-800/90 text-slate-200 text-xs rounded-xl px-3.5 py-2.5 flex items-center justify-between outline-none focus:ring-2 focus:ring-slate-500/50 cursor-pointer shadow-sm transition-all duration-200 active:scale-[0.98] active:opacity-80 active:duration-75 ${
          fontMono ? 'font-mono' : 'font-medium'
        } ${isOpen ? 'ring-2 ring-slate-500/50 border-slate-500/60 bg-slate-800' : ''} ${buttonClassName}`}
      >
        <div className="flex items-center gap-2 truncate pr-2">
          {icon && <span className="shrink-0">{icon}</span>}
          <span className="truncate">{selectedOption ? selectedOption.label : placeholder}</span>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={uiAnimations ? { duration: 0.2 / uiAnimSpeed, ease: 'easeInOut' } : { duration: 0 }}
          className="shrink-0 text-slate-400"
        >
          <ChevronDown className="w-4 h-4" />
        </motion.div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ }}
            animate={{ }}
            exit={{ opacity: 0 }}
            transition={uiAnimations ? { duration: 0.1 / uiAnimSpeed } : { duration: 0 }}
            className={`absolute left-0 right-0 mt-1.5 z-50 dual-kawase-glass glass-specular shadow-2xl rounded-xl p-1.5 max-h-60 overflow-y-auto divide-y divide-slate-800/40 custom-scrollbar ${menuClassName}`}
          >
            <motion.div
              initial={{ y: -6, scale: 0.96 }}
              animate={{ y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.96 }}
              transition={uiAnimations ? { duration: 0.18 / uiAnimSpeed, ease: [0.16, 1, 0.3, 1] } : { duration: 0 }}
              className="w-full h-full"
            >
            {options.map((option) => {
              const isSelected = String(option.value) === String(value);

              return (
                <button
                  key={String(option.value)}
                  type="button"
                  disabled={option.disabled}
                  onClick={() => {
                    if (option.disabled) return;
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left text-xs px-3 py-2 rounded-lg transition-all active:scale-[0.98] active:opacity-80 active:duration-75 flex items-center justify-between gap-2 ${
                    option.indent ? 'pl-6 text-slate-400 hover:text-slate-200' : 'text-slate-200'
                  } ${
                    isSelected
                      ? 'bg-slate-700/60 text-slate-200 font-semibold border border-slate-600/50'
                      : 'hover:bg-slate-800/80 hover:text-white'
                  } ${option.disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'} ${
                    fontMono ? 'font-mono' : ''
                  }`}
                >
                  <span className="truncate">{option.label}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-slate-400 shrink-0" />}
                </button>
              );
            })}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
