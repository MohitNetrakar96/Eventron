import React, { useState } from 'react';
import Head from 'next/head';
import { motion, AnimatePresence } from 'framer-motion';

const AdminRegister = () => {
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
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/setadmin`, {
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
    <div className="min-h-screen flex items-center justify-center bg-gray-900 relative overflow-hidden font-sans">
      <Head>
        <title>Register Admin | EventX</title>
      </Head>

      {/* Background blobs to match the old developers site */}
      <div className="absolute top-[-100px] left-[-100px] w-96 h-96 bg-purple-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-40 animate-blob"></div>
      <div className="absolute top-[-100px] right-[-100px] w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-40 animate-blob" style={{ animationDelay: "2s" }}></div>
      <div className="absolute bottom-[-100px] left-20 w-96 h-96 bg-pink-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-40 animate-blob" style={{ animationDelay: "4s" }}></div>

      <motion.div 
        className="w-full max-w-md bg-gray-800 bg-opacity-50 backdrop-blur-xl border border-gray-700 p-8 rounded-2xl shadow-2xl z-10"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <motion.h2
          className="text-3xl font-bold text-center text-white mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          Add New <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-500">Admin</span>
        </motion.h2>
        
        <motion.form 
          onSubmit={handleSubmit}
          className="flex flex-col gap-5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <motion.div 
            className="flex flex-col gap-1"
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <label className="text-sm font-semibold text-gray-300" htmlFor="name">Full Name</label>
            <motion.input 
              whileFocus={{ scale: 1.02, boxShadow: "0 0 0 2px rgba(139, 92, 246, 0.5)" }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="bg-gray-700 bg-opacity-50 border border-gray-600 text-white rounded-lg px-4 py-3 focus:outline-none transition-colors"
              type="text" 
              id="name" 
              name="name" 
              value={formData.name}
              onChange={handleChange}
              required 
            />
          </motion.div>
          
          <motion.div 
            className="flex flex-col gap-1"
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <label className="text-sm font-semibold text-gray-300" htmlFor="email">Email Address</label>
            <motion.input 
              whileFocus={{ scale: 1.02, boxShadow: "0 0 0 2px rgba(139, 92, 246, 0.5)" }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="bg-gray-700 bg-opacity-50 border border-gray-600 text-white rounded-lg px-4 py-3 focus:outline-none transition-colors"
              type="email" 
              id="email" 
              name="email" 
              value={formData.email}
              onChange={handleChange}
              required 
            />
          </motion.div>
          
          <motion.div 
            className="flex flex-col gap-1"
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.7 }}
          >
            <label className="text-sm font-semibold text-gray-300" htmlFor="password">Password</label>
            <motion.input 
              whileFocus={{ scale: 1.02, boxShadow: "0 0 0 2px rgba(139, 92, 246, 0.5)" }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="bg-gray-700 bg-opacity-50 border border-gray-600 text-white rounded-lg px-4 py-3 focus:outline-none transition-colors"
              type="password" 
              id="password" 
              name="password" 
              value={formData.password}
              onChange={handleChange}
              required 
            />
          </motion.div>
          
          <motion.div 
            className="flex flex-col gap-1"
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.8 }}
          >
            <label className="text-sm font-semibold text-gray-300" htmlFor="confirmPassword">Confirm Password</label>
            <motion.input 
              whileFocus={{ scale: 1.02, boxShadow: "0 0 0 2px rgba(139, 92, 246, 0.5)" }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="bg-gray-700 bg-opacity-50 border border-gray-600 text-white rounded-lg px-4 py-3 focus:outline-none transition-colors"
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
                className="bg-red-500 bg-opacity-20 border border-red-500 text-red-400 px-4 py-3 rounded-lg text-sm text-center"
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
                className="bg-green-500 bg-opacity-20 border border-green-500 text-green-400 px-4 py-3 rounded-lg text-sm text-center"
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
            className="mt-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center shadow-lg hover:shadow-xl transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            disabled={isSubmitting}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.9 }}
          >
            {isSubmitting ? (
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              "Add Admin"
            )}
          </motion.button>
        </motion.form>
      </motion.div>
    </div>
  );
};

export default AdminRegister;
