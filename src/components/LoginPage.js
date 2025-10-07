import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Lock, Eye, EyeOff, ArrowRight, Info, Database } from 'lucide-react';
import DatabaseDiagnosticModal from './shared/DatabaseDiagnosticModal';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showDiagnosticModal, setShowDiagnosticModal] = useState(false);
  const { login, connectionStatus } = useAuth();

  useEffect(() => {
    setIsAnimating(true);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await login(username, password);
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
    <div className="min-h-screen flex login-mobile-stack login-page relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
      {/* Subtle Background Animation */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-600/10 via-transparent to-purple-600/10"></div>
        <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl animate-float-slow"></div>
        <div className="absolute bottom-1/4 left-1/4 w-48 h-48 bg-indigo-500/5 rounded-full blur-3xl animate-float-slow" style={{ animationDelay: '3s' }}></div>
      </div>

      {/* Left Section - Background Image (70% width) */}
      <div className="hidden lg:flex lg:w-[70%] relative">
        {/* Background Image with Blur */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: 'url(/Images/Logistic1Background.png)',
            filter: 'blur(2px)'
          }}
        />

        {/* Enhanced Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent"></div>
        
        {/* Subtle Geometric Elements */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Very subtle floating circles */}
          <div className="absolute top-20 left-20 w-32 h-32 bg-blue-500/3 rounded-full animate-float-slow"></div>
          <div className="absolute top-40 right-32 w-24 h-24 bg-indigo-500/4 rounded-full animate-float-slow" style={{ animationDelay: '2s' }}></div>
          <div className="absolute bottom-32 left-40 w-40 h-40 bg-purple-500/2 rounded-full animate-float-slow" style={{ animationDelay: '4s' }}></div>
          
          {/* Very subtle grid pattern */}
          <div className="absolute top-1/4 right-1/4 w-48 h-48 border border-white/3 rounded-lg transform rotate-12 animate-float-slow" style={{ animationDelay: '1s' }}></div>
          <div className="absolute bottom-1/3 left-1/3 w-32 h-32 border border-white/2 rounded-lg transform -rotate-12 animate-float-slow" style={{ animationDelay: '3s' }}></div>
          
          {/* Very subtle lines */}
          <div className="absolute top-1/2 left-16 w-64 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent transform rotate-45 animate-float-slow" style={{ animationDelay: '0.5s' }}></div>
          <div className="absolute bottom-1/2 right-20 w-48 h-px bg-gradient-to-r from-transparent via-white/3 to-transparent transform -rotate-45 animate-float-slow" style={{ animationDelay: '2.5s' }}></div>
          
          {/* Very subtle floating dots */}
          <div className="absolute top-1/3 left-1/2 w-2 h-2 bg-white/8 rounded-full animate-float-slow" style={{ animationDelay: '1.5s' }}></div>
          <div className="absolute top-2/3 right-1/3 w-1 h-1 bg-white/6 rounded-full animate-float-slow" style={{ animationDelay: '3.5s' }}></div>
          <div className="absolute bottom-1/4 left-1/4 w-1.5 h-1.5 bg-white/5 rounded-full animate-float-slow" style={{ animationDelay: '0.8s' }}></div>
        </div>

        {/* Content Overlay */}
        <div className="relative z-10 flex flex-col justify-center items-start text-left h-full px-16">
          <div className={`max-w-2xl transform transition-all duration-1000 ${isAnimating ? 'translate-x-0 opacity-100' : 'translate-x-8 opacity-0'}`}>
            {/* Main title with modern styling */}
            <div className="mb-8">
              <h1 className="text-7xl font-black text-white mb-8 leading-tight tracking-tight relative">
                LOGISTICS 1
                <div className="absolute -bottom-2 left-0 w-32 h-1 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"></div>
              </h1>
              
              <div className="space-y-3">
                <h2 className="text-4xl font-bold text-white/95 leading-tight">
                  SMART SUPPLY CHAIN
                </h2>
                <h3 className="text-4xl font-bold text-white/95 leading-tight">
                  & PROCUREMENT MANAGEMENT
                </h3>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Background Section */}
      <div className="lg:hidden w-full relative">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: 'url(/Images/Logistic1Background.png)',
            filter: 'blur(2px)'
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70"></div>
        
        {/* Mobile subtle geometric elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-16 left-8 w-24 h-24 bg-blue-500/3 rounded-full animate-float-slow"></div>
          <div className="absolute top-32 right-12 w-20 h-20 bg-indigo-500/4 rounded-full animate-float-slow" style={{ animationDelay: '2s' }}></div>
          <div className="absolute bottom-24 left-16 w-28 h-28 bg-purple-500/2 rounded-full animate-float-slow" style={{ animationDelay: '4s' }}></div>
          
          <div className="absolute top-1/3 right-1/4 w-32 h-32 border border-white/3 rounded-lg transform rotate-12 animate-float-slow" style={{ animationDelay: '1s' }}></div>
          <div className="absolute bottom-1/3 left-1/4 w-24 h-24 border border-white/2 rounded-lg transform -rotate-12 animate-float-slow" style={{ animationDelay: '3s' }}></div>
        </div>
        
        <div className="relative z-10 flex flex-col justify-center items-center text-center px-8 py-16 h-full">
          <div className={`transform transition-all duration-1000 ${isAnimating ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
            <h1 className="text-5xl font-black text-white mb-6">LOGISTICS 1</h1>
            <h2 className="text-2xl font-bold text-white">SMART SUPPLY CHAIN & PROCUREMENT</h2>
          </div>
        </div>
      </div>

      {/* Right Section - Login Form (30% width) */}
      <div className="w-full lg:w-[30%] relative">
        {/* Form Background */}
        <div className="absolute inset-0 bg-white/95 backdrop-blur-xl"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-white/90 to-white/80"></div>

        {/* Login Form Content */}
        <div className="relative z-10 flex flex-col justify-center items-center px-8 py-12 min-h-screen">
          <div className="w-full max-w-sm">
            {/* Logo Section */}
            <div className={`text-center mb-12 transform transition-all duration-1000 delay-200 ${isAnimating ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
              <div className="w-64 h-64 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-full mx-auto mb-6 flex items-center justify-center shadow-xl">
                <img
                  src="/Images/Logistcs1Logo.png"
                  alt="Logistics1 Logo"
                  className="w-56 h-56 object-contain rounded-full"
                />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Welcome Back</h3>
              <p className="text-gray-600">Sign in to your account</p>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className={`space-y-6 transform transition-all duration-1000 delay-300 ${isAnimating ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
              {/* Username Field */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Username</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400 group-focus-within:text-blue-600 transition-colors duration-200" />
                  </div>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your username"
                    className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 hover:border-gray-300"
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Password</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-blue-600 transition-colors duration-200" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full pl-10 pr-10 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 hover:border-gray-300"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors duration-200"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm animate-fade-in">
                  {error}
                </div>
              )}

              {/* Login Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-6 bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-semibold rounded-xl transition-all duration-200 transform hover:scale-[1.02] focus:scale-[1.02] disabled:scale-100 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
              >
                <span className="relative z-10 flex items-center justify-center">
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Signing In...
                    </>
                  ) : (
                    <>
                      Sign In
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
                    </>
                  )}
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
              </button>
            </form>

            {/* Enhanced Connection Status */}
            <div className={`text-center mt-6 transform transition-all duration-1000 delay-500 ${isAnimating ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
              <div className="flex items-center justify-center space-x-3 text-sm">
                <div className={`w-2 h-2 rounded-full ${
                  connectionStatus === 'connected' ? 'bg-green-500' : 
                  connectionStatus === 'local' ? 'bg-yellow-500' : 
                  'bg-gray-400'
                }`}></div>
                <span className={`text-xs ${
                  connectionStatus === 'connected' ? 'text-green-600' : 
                  connectionStatus === 'local' ? 'text-yellow-600' : 
                  'text-gray-500'
                }`}>
                  {connectionStatus === 'connected' ? 'Database Connected' : 
                   connectionStatus === 'local' ? 'Local Mode' : 
                   'Checking Connection...'}
                </span>
                <button
                  onClick={() => setShowDiagnosticModal(true)}
                  className="flex items-center space-x-1 px-2 py-1 text-xs bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                  title="View connection details"
                >
                  <Database className="h-3 w-3" />
                  <span>Details</span>
                </button>
              </div>
              
              {/* Environment Configuration Status */}
              <div className="mt-2 text-xs text-gray-500">
                {!process.env.REACT_APP_SUPABASE_URL && (
                  <div className="flex items-center justify-center space-x-1 text-yellow-600">
                    <Info className="h-3 w-3" />
                    <span>Environment not configured</span>
                  </div>
                )}
                {process.env.REACT_APP_SUPABASE_URL && connectionStatus === 'local' && (
                  <div className="flex items-center justify-center space-x-1 text-yellow-600">
                    <Info className="h-3 w-3" />
                    <span>Database connection failed - using local storage</span>
                  </div>
                )}
              </div>
            </div>

            {/* Help Link */}
            <div className={`text-center mt-4 transform transition-all duration-1000 delay-500 ${isAnimating ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
              <button
                onClick={() => alert('Contact system administrator for assistance')}
                className="text-gray-600 hover:text-blue-600 transition-colors duration-200 text-sm font-medium"
              >
                Need Help?
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Database Diagnostic Modal */}
      <DatabaseDiagnosticModal 
        isOpen={showDiagnosticModal}
        onClose={() => setShowDiagnosticModal(false)}
      />
    </div>
  );
};

export default LoginPage;