# SmartMarket — Lista de supermercado

Aplicativo para organizar **listas de compras**: criar listas, adicionar produtos com quantidade e preço, marcar o que já comprou e ver o total estimado. Desenvolvido com **React Native**, **Expo**, **TypeScript**, **Firebase Authentication** e **Cloud Firestore**.

---

## Sobre este trabalho

| | |
|---|---|
| **Autor** | Caio Martins |
| **Curso** | Sistemas de Informação — 6º período |
| **Disciplina** | Desenvolvimento de Aplicações Móveis |

Este repositório contém o projeto entregue para a disciplina: um app móvel multiplataforma (celular e navegador) com login, dados na nuvem e atualização em tempo real.

---

## O que o app faz (resumo)

- **Conta:** cadastro, login e recuperação de senha por e-mail.
- **Listas:** criar, renomear, abrir e excluir listas de compras.
- **Produtos:** nome, quantidade, preço unitário; marcar como comprado; subtotal e total da lista.
- **Sincronização:** cada usuário vê apenas seus dados; alterações aparecem em tempo real (Firestore).

---

## Como rodar o app (passo a passo)

Siga na ordem. Na primeira vez, reserve cerca de **20–30 minutos** para criar o projeto no Firebase e o arquivo `.env`.

### O que você precisa ter instalado

1. **[Node.js](https://nodejs.org/)** (versão **22.13** ou mais recente) — traz o `npm` junto.
2. **Este projeto** clonado ou baixado na pasta `SmartMarket`.
3. **Para testar no celular (opcional):** app **Expo Go** (Android/iOS), compatível com **Expo SDK 58** (no iPhone só existe a versão mais recente do Expo Go).
4. **Conta Google** para usar o [Firebase Console](https://console.firebase.google.com/).

> **Só quer ver no computador?** Não precisa de Expo Go nem emulador. Use `npx expo start --web` e abra o endereço que aparecer no terminal (geralmente `http://localhost:8081`).

---

### Passo 1 — Instalar as dependências

Abra o terminal **dentro da pasta do projeto** (`SmartMarket`) e execute:

```bash
npm install
```

Espere terminar sem erro.

---

### Passo 2 — Criar e configurar o Firebase (uma vez)

1. Entre em [Firebase Console](https://console.firebase.google.com/) e crie um projeto (ex.: **SmartMarket**).
2. **Authentication** → **Sign-in method** → ative **E-mail/senha**.
3. **Firestore Database** → **Criar banco de dados** → escolha um modo (ex.: produção) e uma região.
4. **Configurações do projeto** (ícone de engrenagem) → **Seus aplicativos** → adicione um app **Web** (`</>`) e copie os valores do `firebaseConfig` (apiKey, authDomain, projectId, etc.).
5. **Firestore Database** → aba **Regras** → copie todo o conteúdo do arquivo `firestore.rules` deste repositório → clique em **Publicar**.

Sem publicar as regras, o app pode logar mas **não consegue salvar listas** no banco.

---

### Passo 3 — Arquivo `.env`

Na raiz do projeto:

**Windows (Prompt ou PowerShell):**

```bash
copy .env.example .env
```

**macOS / Linux:**

```bash
cp .env.example .env
```

Abra `.env` e preencha cada variável com os dados do app Web do Firebase:

```env
EXPO_PUBLIC_FIREBASE_API_KEY=...
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=...
EXPO_PUBLIC_FIREBASE_PROJECT_ID=...
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=...
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
EXPO_PUBLIC_FIREBASE_APP_ID=...
```

Salve o arquivo. **Não commite o `.env`** (ele é só da sua máquina).

> O `.env` usa chaves **públicas** do cliente Firebase (normais em apps mobile). A segurança vem do login e das regras do Firestore — nunca coloque **service account** no app.

---

### Passo 4 — Subir o servidor do Expo

Ainda na pasta `SmartMarket`:

```bash
npx expo install --fix
npx expo start --clear
```

O terminal mostra um **QR Code** e atalhos de teclado.

| Onde rodar | O que fazer |
|------------|-------------|
| **Navegador (PC)** | Pressione `w` ou rode direto: `npx expo start --web` |
| **Celular** | Abra o **Expo Go**, escaneie o QR Code (mesma rede Wi‑Fi do PC) |
| **Android emulador** | Pressione `a` (requer Android Studio configurado) |
| **Rede difícil** | Tente `npx expo start --tunnel` |

Se aparecer **“Configure as credenciais do Firebase”**, o `.env` está vazio ou incorreto — corrija e **reinicie** o Expo (`Ctrl+C` e `npx expo start` de novo).

---

### Passo 5 — Usar o app

1. Na tela inicial, **Cadastre-se** com e-mail e senha (mínimo 6 caracteres).
2. Crie uma **nova lista** (ex.: “Compras da semana”).
3. Entre na lista e **adicione produtos** (nome, quantidade, preço).
4. Marque itens como **comprados** e confira os totais.

Para ver os dados no Firebase: **Firestore Database** → **Dados** → `usuarios` → `{seu UID}` → `listas`. O UID está em **Authentication** → **Users**.

---

## Funcionalidades implementadas

- Criar conta e entrar usando e-mail e senha (Firebase Authentication).
- Recuperar senha por e-mail.
- Persistência de sessão (AsyncStorage no app nativo; navegador no web).
- Criar, renomear, selecionar e excluir listas de compras.
- Adicionar, editar e excluir produtos.
- Campos do produto: `nomeProduto`, `quantidade`, `precoUnitario`, `dataAdicao` (servidor), `comprado`.
- Subtotal por produto e total da lista; resumo de itens comprados.
- Atualização em tempo real com `onSnapshot`.
- Dados isolados por usuário (`uid`) com regras em `firestore.rules`.

---

## Estrutura do Firestore

```text
usuarios/
  {uid}/
    listas/
      {listaId}/
        nome: "Compras do mês"
        criadoEm: timestamp
        produtos/
          {produtoId}/
            nomeProduto: "Arroz 5 kg"
            quantidade: 2
            precoUnitario: 22.50
            dataAdicao: timestamp
            comprado: false
```

Ao excluir uma lista, o app remove antes os produtos da subcoleção, para não deixar documentos órfãos.

---

## Roteiro de testes (para demonstração)

1. Cadastre-se e crie a lista **Compras de sábado**.
2. Adicione **Arroz** — qtd. `2`, preço `22,50` → subtotal **R$ 45,00**.
3. Adicione **Leite** — qtd. `3`, preço `5,90` → subtotal **R$ 17,70**; total **R$ 62,70**.
4. Marque **Arroz** como comprado e confira o destaque e o valor dos comprados.
5. Teste editar, excluir, renomear lista, sair e entrar de novo.
6. Use **Esqueceu sua senha?** na tela de login.
7. (Opcional) Abra o mesmo usuário em outro aparelho e veja a sincronização.

---

## Organização do código

```text
App.tsx                         # telas e estado de autenticação
src/config/firebase.ts          # Firebase e persistência de login
src/services/market.ts          # CRUD e listeners Firestore
src/screens/AuthScreen.tsx      # login, cadastro e recuperação
src/screens/ListsScreen.tsx     # listas de compras
src/screens/ProductsScreen.tsx  # produtos, totais e resumo
src/components/                 # botão e campo de texto reutilizáveis
src/utils/money.ts              # valores em centavos e formatação
src/utils/errors.ts             # mensagens de erro amigáveis
firestore.rules                 # regras de segurança do Firestore
.env.example                    # modelo das variáveis de ambiente
```

---

## Observações técnicas

- O **total da lista** é calculado no app a partir dos produtos, não gravado como campo extra no Firestore.
- Somas usam **centavos** internamente para reduzir erro de arredondamento.
- Cada desenvolvedor ou avaliador precisa do **próprio** projeto Firebase e `.env`; credenciais reais não vêm no repositório.

---

## Documentação oficial

- [Expo — Firebase](https://docs.expo.dev/guides/using-firebase/)
- [Expo — criar projeto](https://docs.expo.dev/get-started/create-a-project/)
- [Firebase — Authentication](https://firebase.google.com/docs/auth)
- [Firebase — Cloud Firestore](https://firebase.google.com/docs/firestore)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)

---

**Caio Martins** — Sistemas de Informação (6º período) · Desenvolvimento de Aplicações Móveis
