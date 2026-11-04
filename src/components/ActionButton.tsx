import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, type ViewStyle } from 'react-native';
import { colors } from '../theme';

type Props = {
  titulo: string;
  onPress: () => void;
  carregando?: boolean;
  desabilitado?: boolean;
  variante?: 'primary' | 'secondary' | 'danger' | 'ghost';
  style?: ViewStyle;
};

export function ActionButton({ titulo, onPress, carregando = false, desabilitado = false, variante = 'primary', style }: Props) {
  const primary = variante === 'primary';
  const danger = variante === 'danger';
  const ghost = variante === 'ghost';
  const fundo = primary ? colors.primary : danger ? colors.dangerLight : ghost ? 'transparent' : colors.primaryLight;
  const tinta = primary ? '#FFFFFF' : danger ? colors.danger : colors.primaryDark;
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={carregando || desabilitado}
      style={({ pressed }) => [styles.base, { backgroundColor: fundo, opacity: (pressed || carregando || desabilitado) ? 0.65 : 1 }, style]}
    >
      {carregando ? <ActivityIndicator color={tinta} /> : <Text style={[styles.texto, { color: tinta }]}>{titulo}</Text>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { minHeight: 52, borderRadius: 16, paddingHorizontal: 18, justifyContent: 'center', alignItems: 'center' },
  texto: { fontSize: 15, fontWeight: '700', textAlign: 'center' },
});
