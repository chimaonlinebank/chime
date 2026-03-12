import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import AccountCreationLoading from './AccountCreationLoading';
import AccountCreationSuccess from './AccountCreationSuccess';
import './AccountCreationFlipCard.css';

interface AccountCreationFlipCardProps {
  progress: number;
  successData: {
    fullName: string;
    routingNumber: string;
    accountNumber: string;
  } | null;
  onContinue: () => void;
  onClose?: () => void;
}

export default function AccountCreationFlipCard({ progress, successData, onContinue, onClose }: AccountCreationFlipCardProps) {
  const [flipped, setFlipped] = useState(false);

  useEffect(() => {
    if (progress >= 100) {
      // Delay slightly for effect
      setTimeout(() => setFlipped(true), 400);
    }
  }, [progress]);

  return (
    <div className="perspective-1200 w-full h-full flex items-center justify-center account-creation-no-blur">
      <motion.div
        className="relative w-full max-w-md min-h-[600px] sm:min-h-[700px]"
        style={{ perspective: 1200 }}
      >
        <motion.div
          className="absolute w-full h-full"
          animate={{ rotateY: flipped ? 180 : 0 }}
          transition={{ duration: 0.8, ease: [0.4, 0.2, 0.2, 1] }}
          style={{ transformStyle: 'preserve-3d' }}
        >
          {/* Front: Loading */}
          <div className="absolute w-full h-full backface-hidden bg-white rounded-2xl">
            <AccountCreationLoading progress={progress} />
          </div>
          {/* Back: Success */}
          <div className="absolute w-full h-full backface-hidden bg-white rounded-2xl flip-card-back">
            {successData && (
              <AccountCreationSuccess
                fullName={successData.fullName}
                routingNumber={successData.routingNumber}
                accountNumber={successData.accountNumber}
                onContinue={onContinue}
                onClose={onClose}
              />
            )}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
