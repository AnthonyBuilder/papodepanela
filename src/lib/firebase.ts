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
  where,
  addDoc,
  serverTimestamp,
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

// ============================================
// Community Recipes Functions
// ============================================

export interface CommunityRecipe {
  id?: string
  title: string
  description: string
  ingredients: string[]
  instructions: string[]
  image?: string
  prepTime: number
  servings: number
  category?: string
  cuisine?: string
  authorId: string
  authorName: string
  createdAt: any
  likes?: number
  likedBy?: string[]
}

/**
 * Cria uma nova receita da comunidade
 */
export async function createCommunityRecipe(recipe: Omit<CommunityRecipe, 'id' | 'createdAt' | 'likes' | 'likedBy'>): Promise<string> {
  const user = auth.currentUser
  if (!user) throw new Error('Usuário não autenticado')
  
  const recipeData = {
    ...recipe,
    authorId: user.uid,
    authorName: user.displayName || user.email || 'Anônimo',
    createdAt: serverTimestamp(),
    likes: 0,
    likedBy: []
  }
  
  const docRef = await addDoc(collection(db, 'communityRecipes'), recipeData)
  return docRef.id
}

/**
 * Busca todas as receitas da comunidade
 */
export async function getCommunityRecipes(): Promise<CommunityRecipe[]> {
  const col = collection(db, 'communityRecipes')
  const q = query(col, orderBy('createdAt', 'desc'))
  const snap = await getDocs(q)
  
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as CommunityRecipe))
}

/**
 * Busca receitas criadas por um usuário específico
 */
export async function getUserRecipes(userId: string): Promise<CommunityRecipe[]> {
  const col = collection(db, 'communityRecipes')
  const q = query(col, where('authorId', '==', userId), orderBy('createdAt', 'desc'))
  const snap = await getDocs(q)
  
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as CommunityRecipe))
}

/**
 * Inscreve-se para atualizações em tempo real das receitas da comunidade
 */
export function subscribeCommunityRecipes(
  callback: (recipes: CommunityRecipe[]) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  const col = collection(db, 'communityRecipes')
  const q = query(col, orderBy('createdAt', 'desc'))
  
  return onSnapshot(
    q,
    (snap) => {
      const recipes = snap.docs.map(d => ({ id: d.id, ...d.data() } as CommunityRecipe))
      callback(recipes)
    },
    onError
  )
}

/**
 * Curtir/descurtir uma receita
 */
export async function toggleLikeRecipe(recipeId: string): Promise<void> {
  const user = auth.currentUser
  if (!user) throw new Error('Usuário não autenticado')
  
  const recipeRef = doc(db, 'communityRecipes', recipeId)
  const recipeSnap = await getDocs(query(collection(db, 'communityRecipes'), where('__name__', '==', recipeId)))
  
  if (recipeSnap.empty) throw new Error('Receita não encontrada')
  
  const recipeData = recipeSnap.docs[0].data() as CommunityRecipe
  const likedBy = recipeData.likedBy || []
  const hasLiked = likedBy.includes(user.uid)
  
  if (hasLiked) {
    // Remove like
    await setDoc(recipeRef, {
      likes: (recipeData.likes || 0) - 1,
      likedBy: likedBy.filter(id => id !== user.uid)
    }, { merge: true })
  } else {
    // Add like
    await setDoc(recipeRef, {
      likes: (recipeData.likes || 0) + 1,
      likedBy: [...likedBy, user.uid]
    }, { merge: true })
  }
}

