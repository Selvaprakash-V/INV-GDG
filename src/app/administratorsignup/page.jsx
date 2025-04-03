'use client'; // This component uses client-side interactivity

import { useState } from 'react';
import styles from './page.module.css';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function AdminSignupPage() {
  const [formData, setFormData] = useState({
    shopName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({
    shopName: false,
    email: false,
    password: false,
    confirmPassword: false
  });
  const router = useRouter();

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
    // Clear error when user types
    if (errors[id]) {
      setErrors(prev => ({
        ...prev,
        [id]: false
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Regex for validation
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Validate inputs
    const newErrors = {
      shopName: formData.shopName.trim() === '',
      email: !emailRegex.test(formData.email),
      password: !passwordRegex.test(formData.password),
      confirmPassword: formData.password !== formData.confirmPassword
    };

    setErrors(newErrors);

    // Check if any errors exist
    const hasErrors = Object.values(newErrors).some(error => error);
    
    if (!hasErrors) {
      // Form is valid, redirect to admin dashboard
      router.push('/admin/dashboard');
    }
  };

  return (
    <div className={styles.mainContainer}>
      {/* Slightly Blurred Background */}
      <div className={styles.backgroundContainer}></div>
      <div className={styles.overlay}></div>

      <div className={styles.card}>
        <h2 className="text-2xl font-bold text-yellow-400 mb-6">Administrator Signup</h2>

        <form id="adminSignupForm" onSubmit={handleSubmit}>
          {/* Shop Name */}
          <div className={styles.inputGroup}>
            <span className={styles.icon}>🏪</span>
            <input
              type="text"
              id="shopName"
              placeholder="Shop Name"
              required
              value={formData.shopName}
              onChange={handleChange}
            />
          </div>
          {errors.shopName && (
            <p className={styles.error}>⚠️ Shop Name is required!</p>
          )}

          {/* Email */}
          <div className={styles.inputGroup}>
            <span className={styles.icon}>📧</span>
            <input
              type="email"
              id="email"
              placeholder="Email"
              required
              value={formData.email}
              onChange={handleChange}
            />
          </div>
          {errors.email && (
            <p className={styles.error}>⚠️ Please enter a valid email!</p>
          )}

          {/* Password */}
          <div className={styles.inputGroup}>
            <span className={styles.icon}>🔒</span>
            <input
              type="password"
              id="password"
              placeholder="Password"
              required
              value={formData.password}
              onChange={handleChange}
            />
          </div>

          {/* Confirm Password */}
          <div className={styles.inputGroup}>
            <span className={styles.icon}>🔒</span>
            <input
              type="password"
              id="confirmPassword"
              placeholder="Confirm Password"
              required
              value={formData.confirmPassword}
              onChange={handleChange}
            />
          </div>

          {/* Error Messages */}
          {errors.password && (
            <p className={styles.error}>
              ⚠️ Password must be at least 8 characters and include an uppercase letter, a lowercase letter, and a number.
            </p>
          )}
          {errors.confirmPassword && (
            <p className={styles.error}>⚠️ Passwords do not match!</p>
          )}

          <button type="submit" className={styles.btn}>
            Sign Up
          </button>
        </form>

        <p className="mt-4 text-gray-400">
          Already registered?{' '}
          <Link href="/login" className="text-yellow-300 font-semibold">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}