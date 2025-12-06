import { useEffect, type ReactNode } from 'react';
import {
  useAppDispatch,
  useAppSelector,
  checkAuth,
  login as loginAction,
  logout as logoutAction,
  refreshUser as refreshUserAction,
} from '../store';
import type { LoginRequest } from '../types';

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  return <>{children}</>;
}

export function useAuth() {
  const dispatch = useAppDispatch();
  const { user, loading, error, isAuthenticated } = useAppSelector((state) => state.auth);

  const login = async (credentials: LoginRequest) => {
    const result = await dispatch(loginAction(credentials));
    if (loginAction.rejected.match(result)) {
      throw { response: { data: { detail: result.payload } } };
    }
  };

  const logout = async () => {
    await dispatch(logoutAction());
  };

  const refreshUser = async () => {
    await dispatch(refreshUserAction());
  };

  return {
    user,
    loading,
    error,
    isAuthenticated,
    login,
    logout,
    refreshUser,
  };
}
