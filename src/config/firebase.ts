import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth, initializeAuth, type Auth, type Persistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { Platform } from 'react-native';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY ?? '',
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN ?? '',
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID ?? '',
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET ?? '',
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? '',
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID ?? '',
};

export const firebaseConfigurado =
  Boolean(firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.appId) &&
  firebaseConfig.apiKey !== 'COLE_AQUI';

// Permite exibir uma tela amigável antes de configurar o projeto.
// Esses valores locais são fictícios e NÃO são utilizados para acessar um Firebase real.
const inicializacao = firebaseConfigurado ? firebaseConfig : {
  ...firebaseConfig,
  apiKey: 'demo-sem-configuracao',
  projectId: 'demo-smartmarket',
  appId: 'demo-smartmarket',
};
const app = getApps().length ? getApp() : initializeApp(inicializacao);

function criarAuth(): Auth {
  if (Platform.OS === 'web') {
    return getAuth(app);
  }

  try {
    const { getReactNativePersistence } = require('firebase/auth') as {
      getReactNativePersistence: (storage: typeof AsyncStorage) => Persistence;
    };
    return initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  } catch (error: unknown) {
    if ((error as { code?: string }).code === 'auth/already-initialized') {
      return getAuth(app);
    }
    throw error;
  }
}

export const auth = criarAuth();
export const db = getFirestore(app);
