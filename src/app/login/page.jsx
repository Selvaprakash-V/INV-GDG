'use client'; // This component uses client-side interactivity

import { useState } from 'react';
import styles from './page.module.css';
import Link from 'next/link';

export default function LoginPage() {
  const [selectedRole, setSelectedRole] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showError, setShowError] = useState(false);

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!selectedRole || !email || !password) {
      setShowError(true);
      return;
    }

    setShowError(false);
    console.log(`Role: ${selectedRole}, Email: ${email}, Password: ${password}`);
    alert(`Login successful as ${selectedRole}!`);
  };

  return (
    <div className={styles.container}>
      <div className={styles.mainContainer}>
        <div className={styles.card}>
          <h2 className={styles.title}>Login</h2>
          <form id="loginForm" onSubmit={handleSubmit}>
            {/* Role Selection Buttons */}
            <div className={styles.roleSelection}>
              <button
                type="button"
                className={`${styles.roleBtn} ${selectedRole === 'Administrator' ? styles.selected : ''}`}
                onClick={() => handleRoleSelect('Administrator')}
              >
                Administrator
              </button>
              <button
                type="button"
                className={`${styles.roleBtn} ${selectedRole === 'Customer' ? styles.selected : ''}`}
                onClick={() => handleRoleSelect('Customer')}
              >
                Customer
              </button>
            </div>

            {/* Email Field */}
            <div className={styles.inputGroup}>
              <span className={styles.icon}>📧</span>
              <input
                type="email"
                id="email"
                placeholder="Email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {/* Password Field */}
            <div className={styles.inputGroup}>
              <span className={styles.icon}>🔒</span>
              <input
                type="password"
                id="password"
                placeholder="Password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <p id="error-message" className={styles.error} style={{ display: showError ? 'block' : 'none' }}>
              Please fill all fields correctly!
            </p>

            <button type="submit" className={styles.loginBtn}>
              Login
            </button>
            <p className={styles.registerLink}>
              Don't have an account? <Link href="/role">Sign up</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}