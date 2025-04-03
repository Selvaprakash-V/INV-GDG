'use client'; // This component uses client-side interactivity

import { useState } from 'react';
import styles from './page.module.css';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function CustomerSignupPage() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({
    passwordMatch: false,
    passwordStrength: false,
    emailValid: false
  });
  const router = useRouter();

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
    // Clear errors when user types
    if (errors.passwordMatch || errors.passwordStrength || errors.emailValid) {
      setErrors({
        passwordMatch: false,
        passwordStrength: false,
        emailValid: false
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Email validation
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const isEmailValid = emailPattern.test(formData.email);

    // Password strength validation
    const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/;
    const isPasswordStrong = passwordPattern.test(formData.password);

    // Password match validation
    const doPasswordsMatch = formData.password === formData.confirmPassword;

    setErrors({
      emailValid: !isEmailValid,
      passwordStrength: !isPasswordStrong,
      passwordMatch: !doPasswordsMatch
    });

    // If all validations pass, redirect to dashboard
    if (isEmailValid && isPasswordStrong && doPasswordsMatch) {
      router.push('/customer/dashboard');
    }
  };

  return (
    <div className={styles.background}>
      <div className={styles.overlay}></div>
      
      <div className={styles.card}>
        <h2 className="text-2xl font-bold text-yellow-400 mb-6">Customer Signup</h2>

        <form id="customerSignupForm" onSubmit={handleSubmit}>
          {/* Full Name */}
          <div className={styles.inputGroup}>
            <span className={styles.icon}>👤</span>
            <input
              type="text"
              id="fullName"
              placeholder="Full Name"
              required
              value={formData.fullName}
              onChange={handleChange}
            />
          </div>

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
            <span className={styles.icon}>🔑</span>
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
          {errors.passwordMatch && (
            <p className={styles.error}>⚠️ Passwords do not match!</p>
          )}
          {errors.passwordStrength && (
            <p className={styles.error}>⚠️ Password must be at least 8 characters and include uppercase, lowercase, and a number.</p>
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