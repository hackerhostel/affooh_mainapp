import React from 'react';
import { XCircleIcon, ExclamationTriangleIcon, InformationCircleIcon } from '@heroicons/react/20/solid';

const ErrorAlertPopup = ({ message, type = 'error', onClose }) => {
  const alertStyles = {
    error: 'bg-red-50 text-red-800 border-red-200',
    warning: 'bg-yellow-50 text-yellow-800 border-yellow-200',
    info: 'bg-blue-50 text-blue-800 border-blue-200',
  };

  const iconStyles = {
    error: 'text-red-400',
    warning: 'text-yellow-400',
    info: 'text-blue-400',
  };

  const Icon = type === 'error' ? XCircleIcon :
    type === 'warning' ? ExclamationTriangleIcon :
      InformationCircleIcon;

  return (
    <div className={`rounded-md p-4 border ${alertStyles[type]}`}>
      <div className="flex">
        <div className="flex-shrink-0">
          <Icon className={`h-5 w-5 ${iconStyles[type]}`} aria-hidden="true" />
        </div>
        <div className="ml-3">
          <p className="text-sm font-medium">{message}</p>
        </div>
        {onClose && (
          <div className="ml-auto pl-3">
            <div className="-mx-1.5 -my-1.5">
              <button
                type="button"
                className={`inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2 ${alertStyles[type]}`}
                onClick={onClose}
              >
                <span className="sr-only">Dismiss</span>
                <XCircleIcon className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ErrorAlertPopup;