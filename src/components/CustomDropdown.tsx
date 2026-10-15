import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, Check } from 'lucide-react';
import { uiSound, UiTapVariant } from '../utils/uiSoundSynthesis';

export interface DropdownOption {
  value: string | number;
  label: string;
  indent?: boolean;
  disabled?: boolean;
}

export interface CustomDropdownProps {
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
  playTapSound?: (variant?: UiTapVariant) => void;
  volumePercent?: number;
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
  playTapSound,
  volumePercent,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
  const [isOpeningUp, setIsOpeningUp] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [menuStyle, setMenuStyle] = useState<React.CSSProperties>({});

  const selectedOption = options.find((opt) => String(opt.value) === String(value));

  const triggerSound = useCallback(
    (variant: UiTapVariant = 'standard') => {
      if (playTapSound) {
        playTapSound(variant);
      } else {
        const effectiveVolume =
          typeof volumePercent === 'number'
            ? volumePercent
            : (() => {
                try {
                  const saved = localStorage.getItem('tapVolume');
                  if (saved !== null) {
                    const parsed = parseFloat(saved);
                    if (!Number.isNaN(parsed)) return parsed;
                  }
                } catch {}
                return 80;
              })();
        uiSound.playTap(effectiveVolume, variant);
      }
    },
    [playTapSound, volumePercent]
  );

  const updatePosition = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const menuMaxHeight = 320; // max-h-80 = 20rem
      const spaceBelow = viewportHeight - rect.bottom - 12;
      const spaceAbove = rect.top - 12;
      const shouldOpenUp = spaceBelow < 180 && spaceAbove > spaceBelow;
      setIsOpeningUp(shouldOpenUp);
      setMenuStyle({
        position: 'fixed',
        left: rect.left,
        width: rect.width,
        zIndex: 9999,
        ...(shouldOpenUp
          ? { bottom: viewportHeight - rect.top + 6, maxHeight: Math.min(menuMaxHeight, spaceAbove) }
          : { top: rect.bottom + 6, maxHeight: Math.min(menuMaxHeight, spaceBelow) }),
      });
    }
  };

  useEffect(() => {
    if (isOpen) {
      updatePosition();
      const idx = options.findIndex((opt) => String(opt.value) === String(value));
      setHighlightedIndex(idx >= 0 ? idx : 0);

      const handleResize = () => updatePosition();
      window.addEventListener('resize', handleResize);
      window.addEventListener('scroll', handleResize, true);
      return () => {
        window.removeEventListener('resize', handleResize);
        window.removeEventListener('scroll', handleResize, true);
      };
    } else {
      setHighlightedIndex(-1);
    }
  }, [isOpen, options, value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        containerRef.current &&
        !containerRef.current.contains(target) &&
        menuRef.current &&
        !menuRef.current.contains(target)
      ) {
        setIsOpen(false);
      } else if (
        containerRef.current &&
        !containerRef.current.contains(target) &&
        !menuRef.current
      ) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        triggerSound('toggle-off');
        setIsOpen(false);
      } else if (event.key === 'ArrowDown') {
        event.preventDefault();
        setHighlightedIndex((prev) => {
          const next = options.length > 0 ? (prev + 1) % options.length : -1;
          triggerSound('subtle');
          return next;
        });
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        setHighlightedIndex((prev) => {
          const next = options.length > 0 ? (prev - 1 + options.length) % options.length : -1;
          triggerSound('subtle');
          return next;
        });
      } else if (event.key === 'Enter') {
        event.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < options.length) {
          const opt = options[highlightedIndex];
          if (!opt.disabled) {
            triggerSound('snap');
            onChange(opt.value);
            setIsOpen(false);
          }
        }
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
  }, [isOpen, options, highlightedIndex, onChange, triggerSound]);

  return (
    <div className={`relative inline-block w-full text-left ${className}`} ref={containerRef}>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => {
          const nextState = !isOpen;
          if (nextState) {
            updatePosition();
          }
          triggerSound(nextState ? 'toggle-on' : 'toggle-off');
          setIsOpen(nextState);
        }}
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

      {createPortal(
        <AnimatePresence>
          {isOpen && (
            <motion.div
              ref={menuRef}
              key="custom-dropdown-panel"
              initial={{
                opacity: 0,
                scaleY: 0,
                y: isOpeningUp ? 8 : -8,
              }}
              animate={{
                opacity: 1,
                scaleY: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                scaleY: 0,
                y: isOpeningUp ? 8 : -8,
              }}
              transition={
                uiAnimations
                  ? {
                      duration: 0.22 / uiAnimSpeed,
                      ease: [0.16, 1, 0.3, 1],
                      opacity: { duration: 0.16 / uiAnimSpeed },
                    }
                  : { duration: 0 }
              }
              style={{
                ...menuStyle,
                transformOrigin: isOpeningUp ? 'bottom center' : 'top center',
              }}
              className={`dual-kawase-glass glass-specular shadow-2xl rounded-xl p-1.5 overflow-y-auto divide-y divide-slate-800/40 custom-scrollbar ${menuClassName}`}
            >
              {options.map((option, idx) => {
                const isSelected = String(option.value) === String(value);
                const isHighlighted = highlightedIndex === idx;

                return (
                  <button
                    key={String(option.value)}
                    type="button"
                    disabled={option.disabled}
                    onMouseEnter={() => setHighlightedIndex(idx)}
                    onClick={() => {
                      if (option.disabled) return;
                      triggerSound('snap');
                      onChange(option.value);
                      setIsOpen(false);
                    }}
                    className={`w-full text-left text-xs px-3 py-2 rounded-lg transition-all active:scale-[0.98] active:opacity-80 active:duration-75 flex items-center justify-between gap-2 ${
                      option.indent ? 'pl-6 text-slate-400 hover:text-slate-200' : 'text-slate-200'
                    } ${
                      isSelected
                        ? 'bg-slate-700/60 text-slate-200 font-semibold border border-slate-600/50'
                        : isHighlighted
                        ? 'bg-slate-800/80 text-white'
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
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
};
