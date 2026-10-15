import React, { useRef, useCallback } from 'react';
import { uiSound } from '../utils/uiSoundSynthesis';

export interface TactileSliderProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value: number;
  min?: number | string;
  max?: number | string;
  step?: number | string;
  volumePercent?: number;
  onChange: (value: number) => void;
  className?: string;
  disabled?: boolean;
}

export const TactileSlider: React.FC<TactileSliderProps> = ({
  value,
  min = 0,
  max = 100,
  step = 1,
  volumePercent,
  onChange,
  className = '',
  disabled = false,
  ...rest
}) => {
  const minNum = typeof min === 'string' ? parseFloat(min) : min;
  const maxNum = typeof max === 'string' ? parseFloat(max) : max;
  const range = maxNum - minNum || 1;
  const lastValRef = useRef(value);

  const getEffectiveVolume = useCallback(() => {
    if (typeof volumePercent === 'number') return volumePercent;
    try {
      const saved = localStorage.getItem('tapVolume');
      if (saved !== null) {
        const parsed = parseFloat(saved);
        if (!Number.isNaN(parsed)) return parsed;
      }
    } catch {}
    return 50;
  }, [volumePercent]);

  const getNormalized = useCallback(
    (val: number) => Math.max(0, Math.min(1, (val - minNum) / range)),
    [minNum, range]
  );

  const handlePointerDown = (e: React.PointerEvent<HTMLInputElement>) => {
    if (disabled) return;
    const vol = getEffectiveVolume();
    const norm = getNormalized(value);
    uiSound.playSliderGrab(norm, vol);
    rest.onPointerDown?.(e);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLInputElement>) => {
    if (disabled) return;
    const vol = getEffectiveVolume();
    uiSound.playSliderRelease(vol);
    rest.onPointerUp?.(e);
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLInputElement>) => {
    if (disabled) return;
    const vol = getEffectiveVolume();
    const norm = getNormalized(value);
    uiSound.playSliderGrab(norm, vol);
    rest.onTouchStart?.(e);
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLInputElement>) => {
    if (disabled) return;
    const vol = getEffectiveVolume();
    uiSound.playSliderRelease(vol);
    rest.onTouchEnd?.(e);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nextVal = parseFloat(e.target.value);
    if (!Number.isNaN(nextVal)) {
      if (nextVal !== lastValRef.current) {
        lastValRef.current = nextVal;
        const norm = getNormalized(nextVal);
        const vol = getEffectiveVolume();
        uiSound.playSliderDrag(norm, vol);
      }
      onChange(nextVal);
    }
  };

  return (
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      disabled={disabled}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onChange={handleChange}
      className={`w-full h-1.5 bg-slate-800 rounded-lg appearance-none accent-slate-400 focus:outline-none transition-opacity ${
        disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
      } ${className}`}
      {...rest}
    />
  );
};

export default TactileSlider;
