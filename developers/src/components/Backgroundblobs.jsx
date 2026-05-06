import React from 'react';
import { motion } from 'framer-motion';

const BackgroundBlobs = () => {
  return (
    <div className="background-blobs">
      <motion.div 
        className="blob blob-1"
        animate={{ 
          x: [0, 30, 0], 
          y: [0, 20, 0], 
          scale: [1, 1.1, 1]
        }}
        transition={{ 
          repeat: Infinity, 
          duration: 15,
          ease: "easeInOut"
        }}
      ></motion.div>
      <motion.div 
        className="blob blob-2"
        animate={{ 
          x: [0, -20, 0], 
          y: [0, -30, 0], 
          scale: [1, 1.15, 1]
        }}
        transition={{ 
          repeat: Infinity, 
          duration: 18,
          ease: "easeInOut"
        }}
      ></motion.div>
    </div>
  );
};

export default BackgroundBlobs;