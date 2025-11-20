import { ExclamationCircleIcon, EyeIcon, EyeSlashIcon, ChevronDownIcon } from '@heroicons/react/24/solid';
import classNames from 'classnames';
import React, { useState } from 'react';

function FormInput(
  {
    type = 'text',
    name,
    formValues,
    placeholder,
    pattern,
    required,
    formErrors,
    onChange,
    onFocus,
    showErrors,
    size = 'normal',
    showLabel = true,
    showShadow = true,
    disabled,
    onKeyDown,
    onMouseDown,
    ariaLabel,
    showPasswordVisibilityIcon = false,
    showDropdownIcon = false, 
    autocomplete,
    ...rest
  },
  ref,
) {
  const hasError = showErrors && formErrors && formErrors[name];
  const [inputType, setInputType] = useState(type);

  const handleToggleType = () => {
    if (inputType === 'password') {
      setInputType('text');
    } else {
      setInputType('password');
    }
  };

  
  return (
    <>
      <div
        className={classNames('relative rounded-md', {
          'shadow-sm': showShadow,
        })}
      >
        <label htmlFor={name} className="block text-sm text-text-color ">
          {showLabel && <span className="capitalize">{placeholder}</span>}
          <input
            aria-label={ariaLabel}
            ref={ref}
            data-testid={name}
            disabled={disabled}
            id={name}
            type={inputType}
            name={name}
            value={name.split('.').reduce((a, b) => (a && a[b] ? a[b] : ''), formValues || {})}

            className={classNames(
              'w-full p-4 rounded-lg shadow-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white',
              {
                'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500':
                  hasError,
                'focus:ring-blue-500 focus:border-blue-500 border-gray-300': !hasError,
              },
              { 'shadow-sm': showShadow },
              { 'mt-1': showLabel },
              { 'py-3': size === 'normal' },
              { 'pl-3': showPasswordVisibilityIcon || showDropdownIcon },
              { 'bg-gray-200 cursor-not-allowed': disabled },
            )}
            placeholder={placeholder}
            pattern={pattern}
            required={required}
            onChange={(e) => onChange?.(e, e.target.value)}
            onFocus={onFocus}
            onKeyDown={onKeyDown}
            onMouseDown={onMouseDown}
            autoComplete={autocomplete}
            {...rest}
          />
          {showPasswordVisibilityIcon && (
            <button
              type="button"
              className="absolute inset-y-1 right-8 pr-3 pt-6 flex items-center"
              onClick={handleToggleType}
            >
              {inputType === 'password' ? (
                <EyeIcon className="h-5 w-5 text-gray-400" />
              ) : (
                <EyeSlashIcon className="h-5 w-5 text-gray-400" />
              )}
            </button>
          )}
          {showDropdownIcon && (
            <ChevronDownIcon className="absolute inset-y-0 right-0 h-5 w-5 text-gray-400 mr-3 mt-6" />
          )}
        </label>
        {hasError && (
          <div className="absolute bottom-2 right-0 pr-3 flex items-center pointer-events-none">
            <ExclamationCircleIcon className="h-5 w-5 text-red-500" aria-hidden="true" />
          </div>
        )}
      </div>
      {hasError && (
        <p className="mt-1 text-sm text-red-600" id="email-error">
          {formErrors && formErrors[name]}
        </p>
      )}
    </>
  );
}
export default React.forwardRef(FormInput);
