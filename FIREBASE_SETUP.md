# Firebase Auth & Firestore Setup

## Pré-requisitos

1. Crie uma conta no [Firebase Console](https://console.firebase.google.com/)
2. Crie um novo projeto Firebase

## Configuração do Firebase

### 1. Habilitar Firebase Authentication

1. No Firebase Console, acesse **Authentication** → **Sign-in method**
2. Habilite **Email/Password**

### 2. Criar uma collection no Firestore

1. Acesse **Firestore Database** → **Create Database**
2. Escolha **Start in test mode** (para desenvolvimento)
3. Selecione a região mais próxima
4. Criará automaticamente a collection `users` quando o primeiro usuário se registrar

### 3. Obter credenciais do Firebase

1. Acesse as **Configurações do projeto** (ícone de engrenagem)
2. Selecione **Meus aplicativos** → **Aplicativo da Web**
3. Copie o objeto de configuração

### 4. Configurar variáveis de ambiente

1. Crie um arquivo `.env.local` na raiz do projeto
2. Adicione as credenciais:

```env
VITE_FIREBASE_API_KEY=sua_api_key
VITE_FIREBASE_AUTH_DOMAIN=seu_projeto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=seu_project_id
VITE_FIREBASE_STORAGE_BUCKET=seu_projeto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=seu_messaging_id
VITE_FIREBASE_APP_ID=seu_app_id
```

## Como funciona

### AuthContext (`src/context/AuthContext.tsx`)

Oferece:
- `signup(email, password, displayName)` - Criar conta
- `login(email, password)` - Fazer login
- `logout()` - Fazer logout
- `updateProfile(displayName)` - Atualizar perfil
- `user` - Usuário autenticado (Firebase User)
- `userProfile` - Dados do usuário no Firestore
- `loading` - Estado de carregamento
- `error` - Erros de autenticação

### LoginPage (`src/pages/LoginPage.tsx`)

Implementa:
- Toggle entre modo login e signup
- Validação básica de campos
- Integração com Firebase Auth
- Armazenamento automático de perfil no Firestore

### Schema do Firestore

**Collection: `users`**

Documento por UID do usuário:
```json
{
  "uid": "usuario_id",
  "email": "usuario@exemplo.com",
  "displayName": "Nome do Usuário",
  "createdAt": "2024-01-09",
  "updatedAt": "2024-01-09"
}
```

## Como usar em outros componentes

```tsx
import { useAuth } from '@/context/AuthContext'

function MyComponent() {
  const { user, userProfile, logout } = useAuth()

  return (
    <div>
      {user && (
        <>
          <p>Olá, {userProfile?.displayName}</p>
          <button onClick={logout}>Logout</button>
        </>
      )}
    </div>
  )
}
```

## Regras de Firestore (Segurança)

Para ambiente de produção, ajuste as regras em **Firestore** → **Rules**:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Apenas usuários autenticados podem ler/escrever seus próprios dados
    match /users/{uid} {
      allow read, write: if request.auth.uid == uid;
    }
  }
}
```

## Próximos passos

1. Adicionar "Esqueci a senha" com `sendPasswordResetEmail()`
2. Adicionar upload de avatar no Storage
3. Vincular receitas favoritas com o usuário
4. Adicionar autenticação com Google/GitHub
