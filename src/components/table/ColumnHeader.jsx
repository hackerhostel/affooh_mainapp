import React from 'react';

const ColumnHeader = ({ label }) => {
  return (
    <th className="py-2 px-4 border-b bg-gray-200 text-left">
      {label}
    </th>
  );
};

export default ColumnHeader;
