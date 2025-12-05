import { Link, useNavigate } from 'react-router-dom';
import { Home, Search, ArrowLeft, Calendar, Users } from 'lucide-react';
import Button from '@/components/common/Button';

const NotFound = () => {
  const navigate = useNavigate();

  const quickLinks = [
    { to: '/', label: 'Home', icon: Home, description: 'Back to homepage' },
    { to: '/events', label: 'Events', icon: Calendar, description: 'Browse events' },
    { to: '/organizations', label: 'Organizations', icon: Users, description: 'Explore clubs' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center py-12 px-4">
      <div className="max-w-2xl w-full text-center">
        {/* 404 Illustration */}
        <div className="mb-8">
          <div className="inline-flex items-center justify-center">
            <span className="text-[150px] md:text-[200px] font-bold bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent leading-none">
              404
            </span>
          </div>
        </div>

        {/* Message */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-display font-bold text-gray-900 mb-4">
            Oops! Page Not Found
          </h1>
          <p className="text-lg text-gray-600 mb-2">
            The page you're looking for doesn't exist or has been moved.
          </p>
          <p className="text-gray-500">
            Don't worry, let's get you back on track!
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center justify-center gap-4 mb-12">
          <Button
            onClick={() => navigate(-1)}
            variant="outline"
            className="flex items-center"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
          <Link to="/">
            <Button variant="primary" className="flex items-center">
              <Home className="h-4 w-4 mr-2" />
              Go Home
            </Button>
          </Link>
        </div>

        {/* Quick Links */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="flex items-center justify-center mb-6">
            <Search className="h-6 w-6 text-gray-400 mr-2" />
            <h2 className="text-xl font-semibold text-gray-900">
              Looking for something?
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {quickLinks.map((link, index) => (
              <Link
                key={index}
                to={link.to}
                className="group p-4 rounded-xl border-2 border-gray-200 hover:border-teal-500 hover:bg-teal-50 transition-all"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="h-12 w-12 bg-gray-100 group-hover:bg-teal-100 rounded-lg flex items-center justify-center mb-3 transition-colors">
                    <link.icon className="h-6 w-6 text-gray-600 group-hover:text-teal-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">{link.label}</h3>
                  <p className="text-sm text-gray-500">{link.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Help Text */}
        <div className="mt-8 text-sm text-gray-500">
          <p>
            If you believe this is an error, please{' '}
            <Link to="/about" className="text-teal-600 hover:text-teal-700 font-medium">
              contact support
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
