import {ExclamationCircleIcon} from '@heroicons/react/24/solid';
import classNames from 'classnames';
import React from 'react';

const FormTextArea = React.forwardRef((
    {
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
        rows = 2,
        disabled,
        onKeyDown,
        onMouseDown,
        ariaLabel,
        autocomplete,
        ...rest
    }, ref) => {
    const hasError = showErrors && formErrors && formErrors[name];
    const value = name.split('.').reduce((a, b) => a ? a[b] : undefined, formValues) || '';


    return (
        <>
            <div
                className={classNames('relative rounded-md', {
                    'shadow-sm': showShadow,
                })}
            >
                <label htmlFor={name} className="block text-sm text-text-color mb-1">
                    {showLabel && <span className="capitalize">{placeholder}</span>}
                    <textarea
                        aria-label={ariaLabel}
                        ref={ref}
                        rows={rows}
                        data-testid={name}
                        disabled={disabled}
                        id={name}
                        name={name}
                        value={value}
                        className={classNames(
                            'w-full p-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white',
                            {
                                'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500': hasError,
                                'focus:ring-blue-500 focus:border-blue-500 border-gray-300': !hasError,
                            },
                            {'shadow-sm': showShadow},
                            {'mt-1': showLabel},
                            {'py-3': size === 'normal'},
                            {'bg-gray-200 cursor-not-allowed': disabled},
                        )}
                        placeholder={placeholder}
                        required={required}
                        onChange={(e) => onChange?.(e, e.target.value)}
                        onFocus={onFocus}
                        onKeyDown={onKeyDown}
                        onMouseDown={onMouseDown}
                        autoComplete={autocomplete}
                        {...rest}
                    />
                </label>
                {hasError && (
                    <div className="absolute bottom-2 right-0 pr-3 flex items-center pointer-events-none">
                        <ExclamationCircleIcon className="h-5 w-5 text-red-500" aria-hidden="true"/>
                    </div>
                )}
            </div>
            {hasError && (
                <p className="mt-1 text-sm text-red-600" id={`${name}-error`}>
                    {formErrors[name]}
                </p>
            )}
        </>
    );
});

export default FormTextArea;
