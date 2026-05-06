// Footer.jsx
import React from 'react';
import { motion } from 'framer-motion';

const Footer = () => {
  return (
    <motion.footer 
      className="footer"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay: 1 }}
    >
      <div className="container footer-container">
        <div className="footer-logo">EventX</div>
        <p>© 2025 EventX. All rights reserved.</p>
      </div>
    </motion.footer>
  );
};

export default Footer;