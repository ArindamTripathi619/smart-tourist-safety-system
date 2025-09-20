import { useState, useEffect, useCallback } from 'react';
import { AppState } from 'react-native';
import { tokenManager } from '../services/api';
import socketService from '../services/socketService';

export interface AuthState {
  isAuthenticated: boolean | null;
  loading: boolean;
}

let authStateListeners: Array<(state: AuthState) => void> = [];
let globalAuthState: AuthState = {
  isAuthenticated: null,
  loading: true,
};

// Global function to update auth state and notify all listeners
const updateGlobalAuthState = (newState: Partial<AuthState>) => {
  globalAuthState = { ...globalAuthState, ...newState };
  authStateListeners.forEach(listener => listener(globalAuthState));
};

// Global function to check auth status
const checkGlobalAuthStatus = async () => {
  try {
    const token = await tokenManager.getToken();
    const userData = await tokenManager.getUserData();
    
    const isUserAuthenticated = !!(token && userData);
    
    if (globalAuthState.isAuthenticated !== isUserAuthenticated) {
      console.log('Auth status changed:', globalAuthState.isAuthenticated, '->', isUserAuthenticated);
      
      updateGlobalAuthState({ isAuthenticated: isUserAuthenticated });
      
      if (isUserAuthenticated) {
        console.log('User authenticated, initializing socket...');
        await socketService.updateToken(token!);
        console.log('Socket.IO initialized with user token');
      } else {
        console.log('User not authenticated');
        socketService.disconnect();
      }
    }
  } catch (error) {
    console.error('Error checking auth status:', error);
    if (globalAuthState.isAuthenticated !== false) {
      updateGlobalAuthState({ isAuthenticated: false });
      socketService.disconnect();
    }
  } finally {
    if (globalAuthState.loading) {
      updateGlobalAuthState({ loading: false });
    }
  }
};

// Function to trigger immediate auth check (called after login/register)
export const refreshAuthStatus = () => {
  checkGlobalAuthStatus();
};

export const useAuth = (): AuthState => {
  const [authState, setAuthState] = useState<AuthState>(globalAuthState);

  const handleAuthStateChange = useCallback((newState: AuthState) => {
    setAuthState(newState);
  }, []);

  useEffect(() => {
    // Add this component as a listener
    authStateListeners.push(handleAuthStateChange);

    // Initialize auth check if this is the first component to mount
    if (authStateListeners.length === 1) {
      checkGlobalAuthStatus();

      // Set up app state change listener
      const handleAppStateChange = (nextAppState: string) => {
        if (nextAppState === 'active') {
          checkGlobalAuthStatus();
        }
      };

      const subscription = AppState.addEventListener('change', handleAppStateChange);

      // Cleanup function for the first component
      return () => {
        authStateListeners = authStateListeners.filter(listener => listener !== handleAuthStateChange);
        subscription?.remove();
      };
    }

    // Cleanup function for subsequent components
    return () => {
      authStateListeners = authStateListeners.filter(listener => listener !== handleAuthStateChange);
    };
  }, [handleAuthStateChange]);

  return authState;
};

export default useAuth;
