import React from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/20/solid';

const SearchBar = ({ placeholder = "Search...", onSearch }) => {
  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 flex text-text-color items-center p-3 pointer-events-none">
        <MagnifyingGlassIcon className="h-7 w-7 pl-2" aria-hidden="true" />
      </div>
      <input
        type="text"
        className="block w-full pl-12 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-gray-50 placeholder-text-text-color focus:outline-none focus:placeholder-gray-800 focus:ring-1 focus:ring-primary-pink focus:border-primary-pink sm:text-sm"
        placeholder={placeholder}
        onChange={(e) => onSearch(e.target.value)}
      />
    </div>
  );
};

export default SearchBar;