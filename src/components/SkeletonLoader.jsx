import React from 'react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

const SkeletonLoader = ({
  bars = 4,
  fillBackground = false,
}) =>
  fillBackground ? (
      <div className="flex flex-col justify-center">
        <div className="w-full bg-white py-8 px-4 shadow-md rounded-lg sm:px-10">
          <Skeleton count={bars} />
        </div>
      </div>
  ) : (
    <Skeleton count={bars} />
  );

export default SkeletonLoader;
