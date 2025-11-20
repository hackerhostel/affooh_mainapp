import React from 'react';

const Table = ({ rows, children }) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white rounded-lg">
        <thead>
        <tr>
          {children}
        </tr>
        </thead>
        <tbody>
        {rows.map((row, index) => (
          <tr key={index} className="hover:bg-gray-100">
            {Object.values(row).map((cell, idx) => (
              <td key={idx} className="py-2 px-4 border-b">{cell}</td>
            ))}
          </tr>
        ))}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
