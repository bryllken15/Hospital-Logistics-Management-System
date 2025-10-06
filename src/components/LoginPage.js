import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Lock, Eye, EyeOff } from 'lucide-react';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = login(username, password);
      if (!result.success) {
        setError(result.error);
      }
    } catch (err) {
      setError('An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex login-mobile-stack login-page">
      {/* Left Section - Background Image with Text Overlay (60%) */}
      <div className="hidden lg:flex lg:w-3/5 relative login-mobile-bg">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: 'url(/Images/Logistic1 Background.png)'
          }}
        />
        
        {/* Blue Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/80 to-blue-800/60"></div>
        
        {/* Main Title Overlay */}
        <div className="relative z-10 flex flex-col justify-center items-center text-center px-16">
          <h1 className="text-6xl lg:text-7xl font-black text-white mb-6 font-montserrat tracking-wide leading-tight login-text-shadow" 
              style={{ 
                filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))'
              }}>
            LOGISTICS 1
          </h1>
          <h2 className="text-3xl lg:text-4xl font-bold text-white/95 mb-4 font-poppins leading-tight login-text-shadow-subtitle"
              style={{ 
                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
              }}>
            SMART SUPPLY CHAIN &
          </h2>
          <h3 className="text-3xl lg:text-4xl font-bold text-white/95 font-poppins leading-tight login-text-shadow-subtitle"
              style={{ 
                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
              }}>
            PROCUREMENT MANAGEMENT
          </h3>
        </div>
      </div>

      {/* Mobile Background Section */}
      <div className="lg:hidden w-full relative login-mobile-bg">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: 'url(/Images/Logistic1Background.png)'
          }}
        />
        
        {/* Blue Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-blue-900/80 to-blue-800/60"></div>
        
        {/* Mobile Title */}
        <div className="relative z-10 flex flex-col justify-center items-center text-center px-8 py-12 h-full">
          <h1 className="text-4xl font-black text-white mb-4 font-montserrat tracking-wide leading-tight login-text-shadow">
            LOGISTICS 1
          </h1>
          <h2 className="text-xl font-bold text-white/95 mb-2 font-poppins leading-tight login-text-shadow-subtitle">
            SMART SUPPLY CHAIN &
          </h2>
          <h3 className="text-xl font-bold text-white/95 font-poppins leading-tight login-text-shadow-subtitle">
            PROCUREMENT MANAGEMENT
          </h3>
        </div>
      </div>

      {/* Right Section - Login Form (40%) */}
      <div className="w-full lg:w-2/5 relative login-mobile-form">
        {/* Blue Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-logistics-blue-500 to-logistics-blue-600"></div>
        
        {/* Login Form Content */}
        <div className="relative z-10 flex flex-col justify-center items-center px-8 py-12 min-h-screen">
          <div className="w-full max-w-md">
            {/* Logo */}
            <div className="text-center mb-8">
              <div className="w-24 h-24 bg-white rounded-full mx-auto mb-6 flex items-center justify-center shadow-2xl">
                <img 
                  src="/Images/Logistcs1 Logo.png" 
                  alt="Logistics1 Logo" 
                  className="w-16 h-16 object-contain"
                />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2 font-poppins">LOGISTICS1</h2>
              <p className="text-white/90 text-sm font-poppins">Smart Supply Chain & Procurement Management</p>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Username Field */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Username"
                  className="w-full pl-12 pr-4 py-4 bg-white border-0 rounded-2xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-white/30 shadow-lg login-input"
                  required
                />
              </div>

              {/* Password Field */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full pl-12 pr-12 py-4 bg-white border-0 rounded-2xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-white/30 shadow-lg login-input"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-500/20 border border-red-500/30 rounded-2xl p-4 text-red-100 text-sm">
                  {error}
                </div>
              )}

              {/* Login Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 px-4 bg-gradient-to-r from-logistics-blue-500 to-logistics-blue-600 text-white font-semibold rounded-2xl hover:from-logistics-blue-600 hover:to-logistics-blue-700 focus:outline-none focus:ring-4 focus:ring-white/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 login-button"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Signing In...
                  </div>
                ) : (
                  'Log In'
                )}
              </button>
            </form>

            {/* Help Link */}
            <div className="text-center mt-6">
              <button 
                onClick={() => alert('Contact system administrator for assistance')}
                className="text-white/70 hover:text-white text-sm underline bg-transparent border-none cursor-pointer transition-colors duration-200"
              >
                Need Help?
              </button>
            </div>

            {/* Demo Credentials */}
            <div className="mt-8 p-4 bg-white/10 rounded-2xl backdrop-blur-sm border border-white/20">
              <h3 className="text-white font-semibold mb-3 text-sm">Demo Credentials:</h3>
              <div className="space-y-2 text-xs text-white/80">
                <div><strong>Admin:</strong> admin / admin123</div>
                <div><strong>Manager:</strong> manager1 / manager123</div>
                <div><strong>Employee:</strong> employee1 / employee123</div>
                <div><strong>Procurement:</strong> procurement1 / procurement123</div>
                <div><strong>Project:</strong> project1 / project123</div>
                <div><strong>Maintenance:</strong> maintenance1 / maintenance123</div>
                <div><strong>Document:</strong> document1 / document123</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
