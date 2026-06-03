import { KeyboardEvent, useEffect, useId, useRef, useState } from 'react';

type Option<T extends string> = {
  value: T;
  label: string;
};

type Props<T extends string> = {
  value: T;
  options: readonly Option<T>[];
  onChange: (value: T) => void;
  name?: string;
  placeholder?: string;
};

export function SelectField<T extends string>({ value, options, onChange, name, placeholder = '--' }: Props<T>) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(() => Math.max(0, options.findIndex((option) => option.value === value)));
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonId = useId();
  const listId = useId();
  const selected = options.find((option) => option.value === value);

  useEffect(() => {
    if (!open) return;
    const closeOnOutside = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', closeOnOutside);
    return () => document.removeEventListener('pointerdown', closeOnOutside);
  }, [open]);

  useEffect(() => {
    setActiveIndex(Math.max(0, options.findIndex((option) => option.value === value)));
  }, [options, value]);

  function choose(index: number) {
    const option = options[index];
    if (!option) return;
    onChange(option.value);
    setOpen(false);
  }

  function onKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (event.key === 'Escape') {
      setOpen(false);
      return;
    }
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      const direction = event.key === 'ArrowDown' ? 1 : -1;
      setOpen(true);
      setActiveIndex((current) => (current + direction + options.length) % options.length);
      return;
    }
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (open) choose(activeIndex);
      else setOpen(true);
    }
  }

  return <div className={open ? 'select-field open' : 'select-field'} ref={rootRef}>
    <input type="hidden" name={name} value={value} />
    <button id={buttonId} type="button" aria-haspopup="listbox" aria-expanded={open} aria-controls={listId} onClick={() => setOpen((current) => !current)} onKeyDown={onKeyDown}>
      <span>{selected?.label || placeholder}</span>
      <i aria-hidden="true" />
    </button>
    {open && <div id={listId} className="select-menu" role="listbox" aria-labelledby={buttonId}>
      {options.map((option, index) => <button
        key={option.value}
        type="button"
        role="option"
        aria-selected={option.value === value}
        className={index === activeIndex ? 'active' : ''}
        onMouseEnter={() => setActiveIndex(index)}
        onClick={() => choose(index)}
      >
        {option.label}
      </button>)}
    </div>}
  </div>;
}
