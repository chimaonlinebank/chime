import React from 'react';
import { motion } from 'motion/react';
import {
  Zap,
  DollarSign,
  Bell,
  TrendingUp,
  Send,
  Lock,
} from 'lucide-react';
import { fadeUpVariants, staggerContainer, hoverLiftVariants } from '../animations';
import './FeaturesSection.css';

interface Feature {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
}

const features: Feature[] = [
  {
    icon: <Zap className="w-8 h-8 text-[#00b388]" />,
    title: 'Early Direct Deposit',
    description:
      'Get paid up to 2 days early with direct deposit. Access your money when you need it.',
    color: '#00b388',
  },
  {
    icon: <DollarSign className="w-8 h-8 text-[#6366f1]" />,
    title: 'No Overdraft Fees',
    description:
      'Never worry about overdraft fees again. We protect your account automatically.',
    color: '#6366f1',
  },
  {
    icon: <Bell className="w-8 h-8 text-[#00a99d]" />,
    title: 'Real-Time Notifications',
    description: 'Stay informed with instant alerts for every transaction. Complete transparency.',
    color: '#00a99d',
  },
  {
    icon: <TrendingUp className="w-8 h-8 text-[#f59e0b]" />,
    title: 'Smart Savings',
    description:
      'Automated savings tools that help you reach your goals faster without thinking.',
    color: '#f59e0b',
  },
  {
    icon: <Send className="w-8 h-8 text-[#00b388]" />,
    title: 'Instant Transfers',
    description:
      'Send and receive money instantly. No delays, no waiting periods.',
    color: '#00b388',
  },
  {
    icon: <Lock className="w-8 h-8 text-[#6366f1]" />,
    title: 'Secure Card Control',
    description:
      'Lock, unlock, and manage your card from your phone. Complete security control.',
    color: '#6366f1',
  },
];

export const FeaturesSection: React.FC = () => {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          variants={fadeUpVariants}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl font-bold text-charcoal-900 mb-4">
            Built for modern banking
          </h2>
          <p className="text-xl text-charcoal-700 max-w-2xl mx-auto">
            Modern features built for the way you live and manage money today.
          </p>
        </motion.div>

        {/* Feature Image Showcase */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          variants={fadeUpVariants}
          transition={{ delay: 0.2 }}
          className="mb-16 w-full"
        >
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="w-full"
          >
            <img
              src="https://miracuves.com/wp-content/uploads/2025/10/chime-digital-banking-app-interface.webp"
              alt="Chime Digital Banking App Interface"
              className="w-full h-auto object-contain"
            />
          </motion.div>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          variants={staggerContainer}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={fadeUpVariants}
              initial="rest"
              whileHover="hover"
              custom={index}
              className="group"
            >
              <div className="h-full bg-white border border-gray-200 rounded-xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div
                  className={`mb-4 p-3 rounded-xl w-fit transition-colors duration-300 bg-[${feature.color}15] text-[${feature.color}]`}
                >
                  {feature.icon}
                </div>

                <h3 className="text-xl font-semibold text-charcoal-900 mb-3">
                  {feature.title}
                </h3>

                <p className="text-charcoal-700 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
