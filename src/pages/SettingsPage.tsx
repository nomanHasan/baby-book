import React from 'react';
import { motion } from 'framer-motion';

const SettingsPage: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen p-6"
    >
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-neutral-800 mb-8">Settings</h1>
        <div className="text-center py-16">
          <p className="text-neutral-600">Settings functionality will be implemented next.</p>
        </div>
      </div>
    </motion.div>
  );
};

export default SettingsPage;