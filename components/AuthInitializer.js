'use client';

import { useEffect } from 'react';
import { getUserToken } from '@/lib/user-auth';

/**
 * AuthInitializer Component
 * Ensures random user is created on first visit to the landing page
 */
export default function AuthInitializer() {
  useEffect(() => {
    // Initialize user token on mount
    async function initializeAuth() {
      try {
        await getUserToken();
      } catch (error) {
        console.error('Failed to initialize user authentication:', error);
      }
    }

    initializeAuth();
  }, []);

  // This component doesn't render anything
  return null;
}
