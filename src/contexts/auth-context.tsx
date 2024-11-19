import React, { createContext, useContext, useReducer, useCallback } from 'react'

interface AuthState {
  token: string | null
  isAuthenticated: boolean
}

type AuthAction = 
  | { type: 'LOGIN'; payload: string }
  | { type: 'LOGOUT' }

const initialState: AuthState = {
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token')
}

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'LOGIN':
      localStorage.setItem('token', action.payload)
      return {
        token: action.payload,
        isAuthenticated: true
      }
    case 'LOGOUT':
      localStorage.removeItem('token')
      return {
        token: null,
        isAuthenticated: false
      }
    default:
      return state
  }
}

interface AuthContextType extends AuthState {
  login: (token: string) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState)

  const login = useCallback((token: string) => {
    dispatch({ type: 'LOGIN', payload: token })
  }, [])

  const logout = useCallback(() => {
    dispatch({ type: 'LOGOUT' })
  }, [])

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Token 过期检查
export function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return Date.now() >= payload.exp * 1000
  } catch {
    return true
  }
} 