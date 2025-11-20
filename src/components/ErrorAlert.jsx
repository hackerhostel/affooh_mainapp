import React from 'react';

const ErrorAlert = ({ message }) => {
  return (
    <div style={{
      backgroundColor: '#f8d7da',
      color: '#721c24',
      padding: '10px',
      borderRadius: '5px',
      border: '1px solid #f5c6cb',
      marginBottom: '10px'
    }}>
      <strong>Error:</strong> {message}
    </div>
  );
};

export default ErrorAlert;