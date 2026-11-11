'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { KeyRound, Lock, Mail, Store, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ROLES } from '@/shared/constants';
import AuthCard, { AuthMessage } from './AuthCard';
import AuthField from './AuthField';
import { PASSWORD_HINT } from './authRules';
import { useSignupForm } from './useSignupForm';

const SHOP_FIELD = { id: 'shopName', label: 'Shop Name', icon: Store, type: 'text', placeholder: 'Enter your shop name', autoComplete: 'organization' };

const COMMON_FIELDS = [
  { id: 'fullName', label: 'Full Name', icon: User, type: 'text', placeholder: 'Enter your full name', autoComplete: 'name' },
  { id: 'email', label: 'Email', icon: Mail, type: 'email', placeholder: 'Enter your email', autoComplete: 'email' },
  { id: 'password', label: 'Password', icon: Lock, type: 'password', placeholder: 'Create a password', autoComplete: 'new-password', hint: PASSWORD_HINT },
  { id: 'confirmPassword', label: 'Confirm Password', icon: KeyRound, type: 'password', placeholder: 'Confirm your password', autoComplete: 'new-password' },
];

const ROLE_CONFIG = {
  [ROLES.CUSTOMER]: {
    icon: User,
    title: 'Customer Signup',
    description: 'Join TRACKIT to track your purchases',
    fields: COMMON_FIELDS,
  },
  [ROLES.ADMIN]: {
    icon: Store,
    title: 'Administrator Signup',
    description: 'Register your supermarket account',
    fields: [SHOP_FIELD, ...COMMON_FIELDS],
  },
};

/** Sign-up form for either role; posts to /api/register and sends the user to /login?registered=1. */
export default function SignupForm({ role }) {
  const config = ROLE_CONFIG[role];
  const { values, errors, formError, isSubmitting, handleChange, handleSubmit } = useSignupForm(role);

  return (
    <AuthCard
      icon={config.icon}
      title={config.title}
      description={config.description}
      footer={
        <p className="text-sm text-gray-600">
          Already registered?{' '}
          <Link href="/login" className="text-purple-600 font-medium hover:text-purple-700">
            Login here
          </Link>
        </p>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {config.fields.map(({ id, ...field }) => (
          <AuthField
            key={id}
            id={id}
            value={values[id]}
            onChange={handleChange}
            error={errors[id]}
            required
            {...field}
          />
        ))}

        {formError && <AuthMessage type="error">{formError}</AuthMessage>}

        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white" disabled={isSubmitting}>
            {isSubmitting ? 'Creating account...' : 'Sign Up'}
          </Button>
        </motion.div>
      </form>
    </AuthCard>
  );
}
