# Configurar Regras de Segurança do Firestore

## ❌ Problema
Erro: `Missing or insufficient permissions` ao salvar receitas.

## ✅ Solução

### Opção 1: Firebase Console (Recomendado)

1. Acesse o [Firebase Console](https://console.firebase.google.com/)
2. Selecione seu projeto
3. No menu lateral, vá em **Firestore Database**
4. Clique na aba **Regras** (Rules)
5. Cole as regras abaixo e clique em **Publicar**:

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    
    // Regras para a coleção de usuários
    match /users/{userId} {
      // Permite que o usuário leia e escreva apenas seus próprios dados
      allow read, write: if request.auth != null && request.auth.uid == userId;
      
      // Regras para as receitas salvas de cada usuário
      match /savedRecipes/{recipeId} {
        // Permite que o usuário leia e escreva apenas suas próprias receitas salvas
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
    
    // Regras para receitas da comunidade
    match /communityRecipes/{recipeId} {
      // Qualquer um pode ler receitas da comunidade
      allow read: if true;
      // Apenas usuários autenticados podem criar receitas
      allow create: if request.auth != null;
      // Apenas o autor pode atualizar ou deletar sua receita
      allow update, delete: if request.auth != null && request.auth.uid == resource.data.authorId;
    }
    
    // Bloqueia acesso a todas as outras coleções por padrão
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

### Opção 2: Firebase CLI

Se você tem o Firebase CLI instalado:

```bash
# Inicializar Firebase no projeto (se ainda não fez)
firebase init firestore

# Deploy das regras
firebase deploy --only firestore:rules
```

## 🔒 O que essas regras fazem?

- ✅ Usuários autenticados podem ler/escrever seus próprios dados em `/users/{userId}`
- ✅ Usuários autenticados podem salvar/remover receitas em `/users/{userId}/savedRecipes`
- ❌ Ninguém pode acessar dados de outros usuários
- ❌ Acesso bloqueado a outras coleções

## ⚠️ Regras de Teste (NÃO usar em produção)

Para testar rapidamente (APENAS em desenvolvimento):

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.time < timestamp.date(2026, 2, 1);
    }
  }
}
```

**⚠️ ATENÇÃO**: Essas regras de teste permitem acesso total ao banco de dados até 1º de fevereiro de 2026. Use apenas para desenvolvimento local!

## 📝 Verificar

Após aplicar as regras:
1. Faça logout e login novamente
2. Tente salvar uma receita
3. Verifique no Firebase Console se os dados aparecem em **Firestore Database → Data**
