import React from 'react';
import { motion } from 'framer-motion';
import { ComponentProps } from '../../types';

interface LayoutProps extends ComponentProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children, className = '' }) => {
  return (
    <div className={`min-h-screen flex flex-col ${className}`}>
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="flex-1"
      >
        {children}
      </motion.main>
    </div>
  );
};

export default Layout;