import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const AdminForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    
    // Validate password match
    if(formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setIsSubmitting(false);
      return;
    }

    try {
      // API call to create admin
      const response = await fetch('http://localhost:5000/setadmin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create admin');
      }
      
      // Success handling
      setSuccess(true);
      setFormData({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
      });
      
      // Reset success message after 3 seconds
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
      
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div 
      className="form-container"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <motion.h2
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        Add New Admin
      </motion.h2>
      
      <motion.form 
        onSubmit={handleSubmit}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <motion.div 
          className="form-group"
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <label htmlFor="name">Full Name</label>
          <motion.input 
            whileFocus={{ scale: 1.02, boxShadow: "0 0 8px rgba(109, 40, 217, 0.5)" }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            type="text" 
            id="name" 
            name="name" 
            value={formData.name}
            onChange={handleChange}
            required 
          />
        </motion.div>
        
        <motion.div 
          className="form-group"
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <label htmlFor="email">Email Address</label>
          <motion.input 
            whileFocus={{ scale: 1.02, boxShadow: "0 0 8px rgba(109, 40, 217, 0.5)" }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            type="email" 
            id="email" 
            name="email" 
            value={formData.email}
            onChange={handleChange}
            required 
          />
        </motion.div>
        
        <motion.div 
          className="form-group"
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.7 }}
        >
          <label htmlFor="password">Password</label>
          <motion.input 
            whileFocus={{ scale: 1.02, boxShadow: "0 0 8px rgba(109, 40, 217, 0.5)" }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            type="password" 
            id="password" 
            name="password" 
            value={formData.password}
            onChange={handleChange}
            required 
          />
        </motion.div>
        
        <motion.div 
          className="form-group"
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.8 }}
        >
          <label htmlFor="confirmPassword">Confirm Password</label>
          <motion.input 
            whileFocus={{ scale: 1.02, boxShadow: "0 0 8px rgba(109, 40, 217, 0.5)" }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            type="password" 
            id="confirmPassword" 
            name="confirmPassword" 
            value={formData.confirmPassword}
            onChange={handleChange}
            required 
          />
        </motion.div>
        
        <AnimatePresence>
          {error && (
            <motion.div 
              className="error-message"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>
        
        <AnimatePresence>
          {success && (
            <motion.div 
              className="success-message"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              Admin created successfully!
            </motion.div>
          )}
        </AnimatePresence>
        
        <motion.button 
          type="submit"
          className="submit-btn"
          disabled={isSubmitting}
          whileHover={{ scale: 1.05, backgroundColor: "#5b21b6" }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.9 }}
        >
          {isSubmitting ? (
            <div className="loading-spinner"></div>
          ) : (
            "Add Admin"
          )}
        </motion.button>
      </motion.form>
    </motion.div>
  );
};

export default AdminForm;