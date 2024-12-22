// File: app/dashboard/admin/_components/MultiSelect.jsx

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Check, ChevronsUpDown, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const MultiSelect = ({
  options,
  selected,
  onChange,
  placeholder,
  disabled,
}) => {
  const [open, setOpen] = useState(false);
  const [localSelected, setLocalSelected] = useState(selected || []);
  const [searchTerm, setSearchTerm] = useState('');
  const [buttonRect, setButtonRect] = useState(null);
  const buttonRef = useRef(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    setLocalSelected(selected || []);
  }, [selected]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (open && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setButtonRect({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
      });
    }
  }, [open]);

  console.log('MultiSelect render', {
    options,
    selected,
    open,
    localSelected,
    buttonRect,
  });

  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (value) => {
    const newSelected = localSelected.includes(value)
      ? localSelected.filter((item) => item !== value)
      : [...localSelected, value];
    setLocalSelected(newSelected);
    onChange(newSelected);
  };

  const handleRemove = (value) => {
    const newSelected = localSelected.filter((item) => item !== value);
    setLocalSelected(newSelected);
    onChange(newSelected);
  };

  const getSelectedLabels = () => {
    return localSelected
      .map((value) => options.find((option) => option.value === value)?.label)
      .filter(Boolean);
  };

  const handleButtonClick = () => {
    console.log('handleButtonClick');
    setOpen(!open);
  };

  const dropdownStyles = buttonRect
    ? {
        position: 'absolute',
        top: `${buttonRect.top}px`,
        left: `${buttonRect.left}px`,
        width: `${buttonRect.width}px`,
        zIndex: 9999,
      }
    : {};

  return (
    <div className="relative">
      <Button
        ref={buttonRef}
        type="button"
        variant="outline"
        role="combobox"
        aria-expanded={open}
        className="w-full justify-between"
        disabled={disabled}
        onClick={() => setOpen(!open)}
      >
        <span className="flex flex-wrap gap-1 items-center">
          {localSelected.length > 0
            ? getSelectedLabels().map((label, index) => (
                <span
                  key={index}
                  className="bg-blue-100 text-blue-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded flex items-center"
                >
                  {label}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemove(
                        options.find((opt) => opt.label === label).value
                      );
                    }}
                    className="ml-1"
                  >
                    <X size={14} />
                  </button>
                </span>
              ))
            : placeholder}
        </span>
        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </Button>
      {open &&
        createPortal(
          <div
            ref={dropdownRef}
            style={dropdownStyles}
            className="max-h-60 overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm"
          >
            <input
              type="text"
              className="w-full px-3 py-2 border-b"
              placeholder={`Search ${placeholder.toLowerCase()}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {filteredOptions.length === 0 && (
              <div className="relative cursor-default select-none py-2 px-4 text-gray-700">
                No {placeholder.toLowerCase()} found.
              </div>
            )}
            {filteredOptions.map((option) => (
              <div
                key={option.value}
                className={cn(
                  'relative cursor-default select-none py-2 pl-10 pr-4',
                  localSelected.includes(option.value)
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-900'
                )}
                onClick={() => handleSelect(option.value)}
              >
                <span
                  className={cn(
                    'block truncate',
                    localSelected.includes(option.value)
                      ? 'font-medium'
                      : 'font-normal'
                  )}
                >
                  {option.label}
                </span>
                {localSelected.includes(option.value) && (
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-white">
                    <Check className="h-5 w-5" aria-hidden="true" />
                  </span>
                )}
              </div>
            ))}
          </div>,
          document.body
        )}
    </div>
  );
};

export default MultiSelect;
