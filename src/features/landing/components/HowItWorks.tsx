import React from 'react';
import { motion } from 'motion/react';
import { CheckCircle2 } from 'lucide-react';
import { fadeUpVariants, staggerContainer } from '../animations';

interface Step {
  number: number;
  title: string;
  description: string;
}

const steps: Step[] = [
  {
    number: 1,
    title: 'Create Account',
    description:
      'Sign up in minutes with just your email and basic information. No lengthy applications.',
  },
  {
    number: 2,
    title: 'Add Funds',
    description:
      'Link your existing bank account or deposit via direct transfer. Funds arrive instantly.',
  },
  {
    number: 3,
    title: 'Spend, Save, Grow',
    description:
      'Start using your account immediately with automatic savings and real-time control.',
  },
];

export const HowItWorks: React.FC = () => {
  return (
    <section className="py-20 sm:py-32 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          variants={fadeUpVariants}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl font-bold text-charcoal-900 mb-4">
            Get Started in 3 Steps
          </h2>
          <p className="text-xl text-charcoal-700 max-w-2xl mx-auto">
            Banking simplified. No hidden complexity. No surprises.
          </p>
        </motion.div>

        {/* Desktop Timeline */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          variants={staggerContainer}
          className="hidden lg:grid grid-cols-3 gap-8 mb-12"
        >
          {steps.map((step, index) => (
            <React.Fragment key={step.number}>
              <motion.div
                variants={fadeUpVariants}
                className="text-center relative"
              >
                <div className="flex justify-center mb-6">
                  <div className="w-16 h-16 rounded-full bg-[#00b388] text-white flex items-center justify-center font-bold text-xl shadow-lg">
                    {step.number}
                  </div>
                </div>

                <h3 className="text-xl font-semibold text-charcoal-900 mb-3">
                  {step.title}
                </h3>

                <p className="text-charcoal-700 leading-relaxed">
                  {step.description}
                </p>

                {/* Connector Line */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-[60%] w-[80%] h-1 bg-gradient-to-r from-[#00b388] to-[#00b388]/30 transform -translate-y-1/2" />
                )}
              </motion.div>
            </React.Fragment>
          ))}
        </motion.div>

        {/* Mobile Timeline */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          variants={staggerContainer}
          className="lg:hidden space-y-8"
        >
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              variants={fadeUpVariants}
              className="relative pl-16"
            >
              <div className="absolute left-0 top-0 w-12 h-12 rounded-full bg-[#00b388] text-white flex items-center justify-center font-bold shadow-lg">
                {step.number}
              </div>

              {index < steps.length - 1 && (
                <div className="absolute left-6 top-12 w-0.5 h-16 bg-gradient-to-b from-[#00b388] to-[#00b388]/30" />
              )}

              <h3 className="text-lg font-semibold text-charcoal-900 mb-2">
                {step.title}
              </h3>

              <p className="text-charcoal-700 leading-relaxed">
                {step.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
