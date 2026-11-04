import React from 'react';
import { StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';
import { colors } from '../theme';

type Props = TextInputProps & { rotulo: string };

export function TextField({ rotulo, style, ...props }: Props) {
  return (
    <View style={styles.campo}>
      <Text style={styles.rotulo}>{rotulo}</Text>
      <TextInput
        {...props}
        placeholderTextColor="#97A79D"
        selectionColor={colors.primary}
        style={[styles.input, style]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  campo: { gap: 7 },
  rotulo: { color: colors.text, fontWeight: '600', fontSize: 13 },
  input: { borderWidth: 1, borderColor: colors.border, backgroundColor: '#FFFFFF', color: colors.text, borderRadius: 14, paddingHorizontal: 15, paddingVertical: 13, fontSize: 16, minHeight: 52 },
});
