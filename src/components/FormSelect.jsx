import React from 'react';
import { ChevronDownIcon, ExclamationCircleIcon } from '@heroicons/react/24/solid';
import classNames from 'classnames';

function FormSelect({
  name,
  formValues,
  placeholder,
  options,
  required,
  formErrors,
  onChange,
  onFocus,
  showErrors,
  size = 'normal',
  showLabel = true,
  showShadow = true,
  disabled = false,
  ariaLabel,
  ...rest
}, ref) {
  const hasError = showErrors && formErrors && formErrors[name];

  return (
    <>
      <div className={classNames('relative rounded-md', {
        'shadow-sm': showShadow,
      })}>
        <label htmlFor={name} className="block text-sm text-gray-500 mb-1">
          {showLabel && <span className="capitalize">{placeholder}</span>}
          <div className="relative">
            <select
              aria-label={ariaLabel}
              ref={ref}
              data-testid={name}
              disabled={disabled}
              id={name}
              name={name}
              value={name.split('.').reduce((a, b) => a?.[b], formValues) ?? ''}
              className={classNames(
                'w-full p-3 rounded-lg shadow-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white cursor-pointer',
                {
                  'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500': hasError,
                  'focus:ring-blue-500 focus:border-blue-500 border-gray-300': !hasError,
                },
                { 'shadow-sm': showShadow },
                { 'mt-1': showLabel },
                { 'py-3': size === 'normal' },
                { 'bg-gray-200 cursor-not-allowed': disabled },
              )}
              required={required}
              onChange={(e) => onChange?.(e, e.target.value)}
              onFocus={onFocus}
              {...rest}
              style={{
                WebkitAppearance: 'none', 
                MozAppearance: 'none', 
                appearance: 'none', 
              }}
            >
              <option value="" disabled>
                Select an option
              </option>
              {options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <ChevronDownIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
          </div>
        </label>
        {hasError && (
          <div className="absolute bottom-2 right-0 pr-3 flex items-center pointer-events-none">
            <ExclamationCircleIcon className="h-5 w-5 text-red-500" aria-hidden="true" />
          </div>
        )}
      </div>
      {hasError && (
        <p className="mt-1 text-sm text-red-600" id={`${name}-error`}>
          {formErrors && formErrors[name]}
        </p>
      )}
    </>
  );
}

export default React.forwardRef(FormSelect);
