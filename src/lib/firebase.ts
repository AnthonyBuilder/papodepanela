import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  getDocs,
  query,
  orderBy,
  onSnapshot,
  type Unsubscribe
} from 'firebase/firestore'

// Substitua com suas credenciais do Firebase Console
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

// Initialize Firebase
export const app = initializeApp(firebaseConfig)

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app)

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app)

// ============================================
// Saved Recipes Functions
// ============================================

export interface SavedRecipe {
  id: string | number
  title: string
  image?: string
  imageType?: string
  readyInMinutes?: number
  servings?: number
  savedAt: string
  // Campos adicionais que você quiser salvar
  summary?: string
  cuisines?: string[]
  diets?: string[]
}

/**
 * Salva uma receita no perfil do usuário
 */
export async function saveRecipeToProfile(recipe: SavedRecipe): Promise<void> {
  const user = auth.currentUser
  if (!user) throw new Error('Usuário não autenticado')
  
  const recipeId = String(recipe.id)
  const recipeData = {
    ...recipe,
    id: recipeId,
    savedAt: new Date().toISOString(),
  }
  
  await setDoc(doc(db, 'users', user.uid, 'savedRecipes', recipeId), recipeData)
}

/**
 * Remove uma receita salva do perfil do usuário
 */
export async function removeRecipeFromProfile(recipeId: string | number): Promise<void> {
  const user = auth.currentUser
  if (!user) throw new Error('Usuário não autenticado')
  
  await deleteDoc(doc(db, 'users', user.uid, 'savedRecipes', String(recipeId)))
}

/**
 * Recupera todas as receitas salvas do usuário
 */
export async function getSavedRecipes(): Promise<SavedRecipe[]> {
  const user = auth.currentUser
  if (!user) throw new Error('Usuário não autenticado')
  
  const col = collection(db, 'users', user.uid, 'savedRecipes')
  const q = query(col, orderBy('savedAt', 'desc'))
  const snap = await getDocs(q)
  
  return snap.docs.map(d => d.data() as SavedRecipe)
}

/**
 * Subscribe to real-time updates of saved recipes
 */
export function subscribeSavedRecipes(
  callback: (recipes: SavedRecipe[]) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  const user = auth.currentUser
  if (!user) throw new Error('Usuário não autenticado')
  
  const col = collection(db, 'users', user.uid, 'savedRecipes')
  const q = query(col, orderBy('savedAt', 'desc'))
  
  return onSnapshot(
    q,
    (snap) => {
      const recipes = snap.docs.map(d => d.data() as SavedRecipe)
      callback(recipes)
    },
    onError
  )
}

export default app
