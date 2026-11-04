import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { StatusBar } from 'expo-status-bar';
import { auth, firebaseConfigurado } from './src/config/firebase';
import { AuthScreen } from './src/screens/AuthScreen';
import { ListsScreen } from './src/screens/ListsScreen';
import { ProductsScreen } from './src/screens/ProductsScreen';
import { colors } from './src/theme';
import type { ShoppingList } from './src/types';

export default function App() {
  const [usuario, setUsuario] = useState<User | null>(null);
  const [inicializando, setInicializando] = useState(true);
  const [listaAtiva, setListaAtiva] = useState<ShoppingList | null>(null);

  useEffect(() => {
    if (!firebaseConfigurado) {
      setInicializando(false);
      return;
    }
    return onAuthStateChanged(auth, (proximoUsuario) => {
      setUsuario(proximoUsuario);
      if (!proximoUsuario) setListaAtiva(null);
      setInicializando(false);
    });
  }, []);

  if (!firebaseConfigurado) {
    return (
      <View style={styles.centro}>
        <Text style={styles.icone}>🛒</Text>
        <Text style={styles.titulo}>SmartMarket</Text>
        <Text style={styles.aviso}>Configure as credenciais do Firebase.</Text>
        <Text style={styles.texto}>Copie .env.example para .env, informe os dados do seu projeto Firebase e reinicie o Expo.</Text>
        <StatusBar style="dark" />
      </View>
    );
  }

  if (inicializando) {
    return <View style={styles.centro}><ActivityIndicator size="large" color={colors.primary} /><StatusBar style="dark" /></View>;
  }

  return (
    <View style={styles.container}>
      {usuario ? (
        listaAtiva ? (
          <ProductsScreen uid={usuario.uid} lista={listaAtiva} voltar={() => setListaAtiva(null)} />
        ) : (
          <ListsScreen usuario={usuario} abrirLista={setListaAtiva} />
        )
      ) : (
        <AuthScreen />
      )}
      <StatusBar style="dark" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  centro: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 28, backgroundColor: colors.background },
  icone: { fontSize: 48, marginBottom: 12 },
  titulo: { fontSize: 28, fontWeight: '800', color: colors.primary, marginBottom: 18 },
  aviso: { fontSize: 18, fontWeight: '700', color: colors.text, textAlign: 'center', marginBottom: 8 },
  texto: { color: colors.muted, textAlign: 'center', lineHeight: 22 },
});
