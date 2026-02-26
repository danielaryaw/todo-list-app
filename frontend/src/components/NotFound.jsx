import { Link } from "react-router-dom";
import { FiHome, FiAlertTriangle } from "react-icons/fi";

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-100 mb-6">
          <FiAlertTriangle className="w-10 h-10 text-red-600" />
        </div>

        <h1 className="text-6xl font-bold text-gray-900 dark:text-white mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-6">Page Not Found</h2>

        <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">The page you're looking for doesn't exist or has been moved.</p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/dashboard" className="inline-flex items-center justify-center px-6 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors">
            <FiHome className="mr-2" />
            Go to Dashboard
          </Link>

          <button onClick={() => window.history.back()} className="inline-flex items-center justify-center px-6 py-3 bg-gray-200 text-gray-800 font-medium rounded-lg hover:bg-gray-300 transition-colors">
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
