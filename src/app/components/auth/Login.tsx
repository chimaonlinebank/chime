import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Lock, Mail, Home } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { signInWithSupabase } from '../../../services/supabaseAuthService';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const resp = await signInWithSupabase(email, password);
      if (resp.error) throw resp.error;
      navigate('/dashboard');
    } catch (err) {
      setError('Invalid email or password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="p-6 md:p-8 flex items-center justify-between"
      >
        <div className="flex items-center gap-2">
          <img
            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTXoL24HHFZY9sDPlej_aDDojZL8felyKfctw&s"
            alt="Chime Logo"
            className="w-10 h-10 rounded-xl shadow-lg shadow-[#00b388]/20 object-contain"
          />
          <img
            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS7Cw9mOE-9j4eqntzmCEZLobhu9blcCexiqQ&s"
            alt="Chime Next"
            className="h-8 object-contain"
          />
        </div>
        <motion.button
          whileHover={{ x: -2 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/')}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-charcoal-700 hover:bg-gray-100 transition-colors"
          title="Back to home"
        >
          <Home className="w-5 h-5" />
          <span className="text-sm font-medium">Back to Home</span>
        </motion.button>
      </motion.div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center px-6 pb-16 pt-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="w-full max-w-md"
        >
          <div className="mb-8 text-center">
            <h2 className="text-3xl mb-2 font-semibold">Welcome back</h2>
            <p className="text-muted-foreground">Sign in to your banking account securely</p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="bg-slate-50/50 border border-slate-200 rounded-2xl p-6 space-y-4">
              <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2 mb-4">
                <Mail className="w-4 h-4 text-[#00b388]" />
                Enter Your Email
              </h3>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-12 bg-white border border-slate-200 focus:ring-2 focus:ring-[#00b388]/20 shadow-sm focus:shadow-md"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password *</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 h-12 bg-white border border-slate-200 focus:ring-2 focus:ring-[#00b388]/20 shadow-sm focus:shadow-md"
                    required
                  />
                </div>
              </div>
            </div>

            <motion.div
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              <Button
                type="submit"
                className="w-full h-12 bg-[#00b388] hover:bg-[#009670] text-white shadow-lg shadow-[#00b388]/20 transition-all"
                disabled={isLoading}
              >
                {isLoading ? 'Signing In...' : 'Sign In'}
              </Button>
            </motion.div>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground">
              Don't have an account?{' '}
              <button
                onClick={() => navigate('/register')}
                className="text-[#00b388] hover:text-[#009670] transition-colors font-medium"
              >
                Create Account
              </button>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
