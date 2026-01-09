import { createContext, useContext, useEffect, useState } from 'react'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User,
} from 'firebase/auth'
import { doc, setDoc, getDoc } from 'firebase/firestore'
import { auth, db } from '@/lib/firebase'

interface UserProfile {
  uid: string
  email: string
  displayName?: string
  createdAt?: Date
  updatedAt?: Date
}

interface AuthContextType {
  user: User | null
  userProfile: UserProfile | null
  loading: boolean
  error: string | null
  signup: (email: string, password: string, displayName?: string) => Promise<void>
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  updateProfile: (displayName: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Monitor auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      try {
        setUser(currentUser)
        if (currentUser) {
          // Fetch user profile from Firestore
          const userDocRef = doc(db, 'users', currentUser.uid)
          const userDocSnap = await getDoc(userDocRef)
          if (userDocSnap.exists()) {
            setUserProfile(userDocSnap.data() as UserProfile)
          }
        } else {
          setUserProfile(null)
        }
      } catch (err) {
        console.error('Error fetching user profile:', err)
      } finally {
        setLoading(false)
      }
    })

    return unsubscribe
  }, [])

  const signup = async (email: string, password: string, displayName?: string) => {
    try {
      setError(null)
      const result = await createUserWithEmailAndPassword(auth, email, password)
      const newUser = result.user

      // Create user profile in Firestore
      const userProfile: UserProfile = {
        uid: newUser.uid,
        email: newUser.email || '',
        displayName: displayName || '',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      await setDoc(doc(db, 'users', newUser.uid), userProfile)
      setUserProfile(userProfile)
    } catch (err: any) {
      const message = err.message || 'Erro ao criar conta'
      setError(message)
      throw err
    }
  }

  const login = async (email: string, password: string) => {
    try {
      setError(null)
      await signInWithEmailAndPassword(auth, email, password)
    } catch (err: any) {
      const message = err.message || 'Erro ao fazer login'
      setError(message)
      throw err
    }
  }

  const logout = async () => {
    try {
      setError(null)
      await signOut(auth)
      setUser(null)
      setUserProfile(null)
    } catch (err: any) {
      const message = err.message || 'Erro ao fazer logout'
      setError(message)
      throw err
    }
  }

  const updateProfile = async (displayName: string) => {
    try {
      setError(null)
      if (user) {
        const userDocRef = doc(db, 'users', user.uid)
        const updatedProfile: Partial<UserProfile> = {
          displayName,
          updatedAt: new Date(),
        }
        await setDoc(userDocRef, updatedProfile, { merge: true })
        setUserProfile((prev) => prev ? { ...prev, ...updatedProfile } : null)
      }
    } catch (err: any) {
      const message = err.message || 'Erro ao atualizar perfil'
      setError(message)
      throw err
    }
  }

  const value: AuthContextType = {
    user,
    userProfile,
    loading,
    error,
    signup,
    login,
    logout,
    updateProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
