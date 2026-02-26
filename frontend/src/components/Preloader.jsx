import React from "react";

const Preload = () => {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-primary-50 to-primary-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center z-50">
      <div className="text-center">
        {/* Logo with animation */}
        <div className="relative mb-8">
          <div className="w-24 h-24 mx-auto relative">
            {/* Pulsing background circle */}
            <div className="absolute inset-0 rounded-full bg-primary-200 dark:bg-primary-800 animate-ping opacity-20"></div>

            {/* Logo container */}
            <div className="relative w-full h-full rounded-full bg-white dark:bg-gray-800 shadow-lg flex items-center justify-center animate-fadeInUp">
              <img src="/icons/icon32.png" alt="Todo List Logo" className="w-16 h-16 animate-pulse" />
            </div>
          </div>
        </div>

        {/* Loading text */}
        <div className="animate-fadeInUp animation-delay-300">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Loading</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">Preparing your tasks...</p>

          {/* Animated dots */}
          <div className="flex justify-center space-x-2">
            <div className="w-3 h-3 bg-primary-600 rounded-full animate-bounce"></div>
            <div className="w-3 h-3 bg-primary-600 rounded-full animate-bounce animation-delay-100"></div>
            <div className="w-3 h-3 bg-primary-600 rounded-full animate-bounce animation-delay-200"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Preload;
