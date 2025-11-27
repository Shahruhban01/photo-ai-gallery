import React, { useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { logout, fetchProfile } from '../store/slices/authSlice';

export const Layout: React.FC = () => {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated && !user) {
      dispatch(fetchProfile());
    }
  }, [dispatch, isAuthenticated, user]);

  const handleLogout = () => {
    dispatch(logout());
  };

  const navItems = [
    { path: '/', label: 'Gallery', icon: '📷' },
    { path: '/upload', label: 'Upload', icon: '⬆️' },
    { path: '/albums', label: 'Albums', icon: '📁' },
    { path: '/people', label: 'People', icon: '👥' },
    { path: '/search', label: 'Search', icon: '🔍' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-3">
              <span className="text-2xl">📸</span>
              <span className="text-xl font-bold text-gray-900">Photo AI Gallery</span>
            </Link>

            <div className="flex items-center space-x-4">
              {user && (
                <span className="text-sm text-gray-600">
                  Hello, {user.name}
                </span>
              )}
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-1 overflow-x-auto py-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                  location.pathname === item.path
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-center text-sm text-gray-500">
            © {new Date().getFullYear()} Photo AI Gallery. AI-Powered Photo Organization.
          </p>
        </div>
      </footer>
    </div>
  );
};
