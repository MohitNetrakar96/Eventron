// Header.jsx
import React from 'react';
import { motion } from 'framer-motion';

const Header = () => {
  return (
    <motion.header 
      className="header"
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 100, damping: 15 }}
    >
      <div className="container header-container">
        <motion.div 
          className="logo"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          EventX
        </motion.div>
        <motion.nav>
          <motion.ul>
            <motion.li 
              whileHover={{ scale: 1.1, color: "#6d28d9" }}
              whileTap={{ scale: 0.95 }}
            >
              Dashboard
            </motion.li>
            <motion.li 
              whileHover={{ scale: 1.1, color: "#6d28d9" }}
              whileTap={{ scale: 0.95 }}
              className="active"
            >
              Add Admin
            </motion.li>
            <motion.li 
              whileHover={{ scale: 1.1, color: "#6d28d9" }}
              whileTap={{ scale: 0.95 }}
            >
              Settings
            </motion.li>
          </motion.ul>
        </motion.nav>
      </div>
    </motion.header>
  );
};

export default Header;