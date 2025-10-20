/**
 * Shared Authentication Service
 * Provides consistent Firebase auth token access across all frontend services
 */

import { auth } from '../config/firebase';

class AuthService {
  /**
   * Get current Firebase ID token
   * @returns {Promise<string|null>} Firebase ID token or null
   */
  async getToken() {
    if (auth && auth.currentUser) {
      try {
        const token = await auth.currentUser.getIdToken();
        console.log('🔑 Firebase token retrieved successfully');
        return token;
      } catch (error) {
        console.error('❌ Failed to get Firebase ID token:', error);
        return null;
      }
    }
    console.warn('⚠️ No Firebase user authenticated - token unavailable');
    return null;
  }
  
  /**
   * Get current Firebase user object
   * @returns {object|null} Firebase user or null
   */
  getCurrentUser() {
    return auth?.currentUser || null;
  }
  
  /**
   * Check if user is authenticated
   * @returns {boolean} True if authenticated
   */
  isAuthenticated() {
    return !!auth?.currentUser;
  }
  
  /**
   * Get current user ID
   * @returns {string|null} Firebase UID or null
   */
  getUserId() {
    return auth?.currentUser?.uid || null;
  }
  
  /**
   * Get user email
   * @returns {string|null} User email or null
   */
  getUserEmail() {
    return auth?.currentUser?.email || null;
  }
}

export default new AuthService();

