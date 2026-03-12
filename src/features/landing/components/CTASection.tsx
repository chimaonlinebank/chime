import React from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { fadeUpVariants } from '../animations';

export const CTASection: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-[#e6f9f4]/30">
      <div className="max-w-4xl mx-auto text-center">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          variants={fadeUpVariants}
        >
          <h2 className="text-4xl sm:text-5xl font-bold text-charcoal-900 mb-6">
            Ready to experience better banking?
          </h2>

          <p className="text-xl text-charcoal-700 mb-10 max-w-2xl mx-auto">
            Join thousands of users who have already switched to modern banking.
            It only takes a few minutes to get started.
          </p>

          <motion.button
            whileHover={{ y: -2 }}
            whileTap={{ y: 0 }}
            onClick={() => navigate('/register')}
            className="inline-block px-10 py-4 bg-[#00b388] hover:bg-[#009670] text-white font-semibold rounded-lg shadow-lg shadow-[#00b388]/30 transition-all duration-300 text-lg"
          >
            Create Free Account
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
};
