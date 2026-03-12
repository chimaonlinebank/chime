import { useState } from 'react';
import { motion } from 'motion/react';
import { Mail, Chrome } from 'lucide-react';
import { Button } from '../ui/button';
import './GoogleSignupButton.css';

interface GoogleSignupProps {
  onGoogleSignup: () => void;
  onEmailSignup: () => void;
  isLoading?: boolean;
}

export default function GoogleSignupButton({ onGoogleSignup, onEmailSignup, isLoading = false }: GoogleSignupProps) {
  const [hoveredButton, setHoveredButton] = useState<string | null>(null);

  return (
    <div className="space-y-3 w-full">
      {/* Google Signup */}
      <motion.button
        onClick={onGoogleSignup}
        disabled={isLoading}
        onMouseEnter={() => setHoveredButton('google')}
        onMouseLeave={() => setHoveredButton(null)}
        whileHover={!isLoading ? { y: -2 } : {}}
        whileTap={!isLoading ? { scale: 0.98 } : {}}
        className={`w-full py-3 px-4 rounded-xl border-2 flex items-center justify-center gap-3 font-semibold transition-all google-signup-button ${
          isLoading ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        <Chrome className="w-5 h-5 google-icon" />
        <span className="google-text">Sign up with Google</span>
      </motion.button>

      {/* Email Signup */}
      <motion.button
        onClick={onEmailSignup}
        disabled={isLoading}
        onMouseEnter={() => setHoveredButton('email')}
        onMouseLeave={() => setHoveredButton(null)}
        whileHover={!isLoading ? { y: -2 } : {}}
        whileTap={!isLoading ? { scale: 0.98 } : {}}
        className={`w-full py-3 px-4 rounded-xl border-2 flex items-center justify-center gap-3 font-semibold transition-all email-signup-button ${
          isLoading ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        <Mail className="w-5 h-5 email-icon" />
        <span className="email-text">Sign up with Email</span>
      </motion.button>

      {/* Divider */}
      <div className="relative py-4">
        <div className="absolute inset-x-0 top-1/2 h-px bg-gray-200"></div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-muted-foreground">or</span>
        </div>
      </div>

      {/* Info text */}
      <p className="text-center text-sm text-muted-foreground">
        No credit card required. Get $10 bonus upon account creation! 🎉
      </p>
    </div>
  );
}
