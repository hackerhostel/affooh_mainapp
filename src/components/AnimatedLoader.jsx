import React from 'react';

const AnimatedLoader = ({ 
  size = 'medium', 
  message = 'Loading...',
  showMessage = true,
  fullScreen = false,
  className = '',
  animationType = 'jumpSlide' 
}) => {
  // Size configurations
  const sizeConfig = {
    small: {
      container: 'w-32 h-8',
      block: 'w-6 h-6',
      gap: 'gap-2'
    },
    medium: {
      container: 'w-40 h-10',
      block: 'w-7 h-7',
      gap: 'gap-3'
    },
    large: {
      container: 'w-48 h-12',
      block: 'w-8 h-8',
      gap: 'gap-4'
    }
  };

  const config = sizeConfig[size] || sizeConfig.medium;

  // Jump and slide blocks 
  const jumpSlideBlocks = [
    { delay: '0s', color: 'from-pink-600 to-pink-700' },
    { delay: '0.15s', color: 'from-pink-500 to-pink-600' },
    { delay: '0.3s', color: 'from-pink-400 to-pink-500' },
    { delay: '0.45s', color: 'from-rose-400 to-pink-400' },
    { delay: '0.6s', color: 'from-rose-300 to-rose-400' }
  ];

  // Grid blocks for pulse scale animation
  const gridBlocks = [
    { delay: '0s', position: 'top-left' },
    { delay: '0.1s', position: 'top-center' },
    { delay: '0.2s', position: 'top-right' },
    { delay: '0.3s', position: 'middle-left' },
    { delay: '0.4s', position: 'center' },
    { delay: '0.5s', position: 'middle-right' },
    { delay: '0.6s', position: 'bottom-left' },
    { delay: '0.7s', position: 'bottom-center' },
    { delay: '0.8s', position: 'bottom-right' }
  ];

  const containerClasses = fullScreen 
    ? 'fixed inset-0 bg-white bg-opacity-90 z-50 flex flex-col items-center justify-center'
    : `flex flex-col items-center justify-center p-8 ${className}`;

  return (
    <div className={containerClasses}>
      {/* Jump and Slide Animation */}
      {animationType === 'jumpSlide' && (
        <div className={`flex items-end justify-center ${config.gap} mb-6`} style={{ height: '60px' }}>
          {jumpSlideBlocks.map((block, index) => (
            <div
              key={index}
              className={`
                ${config.block}
                bg-gradient-to-br ${block.color}
                rounded-lg
                animate-jump-slide
                shadow-lg
              `}
              style={{
                animationDelay: block.delay,
                animationDuration: '1.2s',
                animationIterationCount: 'infinite',
                animationTimingFunction: 'ease-in-out'
              }}
            />
          ))}
        </div>
      )}

      {/* Grid Pulse Scale Animation */}
      {animationType === 'pulseScale' && (
        <div className={`relative w-32 h-32 mb-4`}>
          <div className={`grid grid-cols-3 gap-1 w-full h-full`}>
            {gridBlocks.map((block, index) => (
              <div
                key={index}
                className={`
                  w-5 h-5
                  bg-gradient-to-br from-pink-500 to-pink-700
                  rounded-sm
                  animate-pulse-scale
                  shadow-sm
                `}
                style={{
                  animationDelay: block.delay,
                  animationDuration: '1.5s',
                  animationIterationCount: 'infinite',
                  animationTimingFunction: 'ease-in-out'
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Loading Message */}
      {showMessage && (
        <div className="text-center">
          <p className="text-gray-600 font-medium text-sm md:text-base animate-pulse">
            {message}
          </p>
        </div>
      )}
    </div>
  );
};

export default AnimatedLoader;
