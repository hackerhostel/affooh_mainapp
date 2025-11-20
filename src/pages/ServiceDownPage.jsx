import React from 'react';

const ServiceDownPage = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="text-center px-4">
        <div className="mb-4">
          <svg className="mx-auto h-16 w-16 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h1 className="mb-4 text-2xl font-bold text-gray-800">Service Temporarily Unavailable</h1>
        <p className="mb-6 text-gray-600">
          We're sorry, but our service is currently down for maintenance.
          Our team is working hard to bring it back online as soon as possible.
        </p>
        <p className="text-sm text-gray-500">
          Estimated restoration time: <span className="font-semibold">2 hours</span>
        </p>
      </div>
    </div>
  );
};

export default ServiceDownPage;