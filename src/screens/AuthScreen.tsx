import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { createUserWithEmailAndPassword, sendPasswordResetEmail, signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../config/firebase';
import { ActionButton } from '../components/ActionButton';
import { TextField } from '../components/TextField';
import { colors } from '../theme';
import { mensagemErro } from '../utils/errors';

type Mode = 'login' | 'register' | 'reset';

export function AuthScreen() {
  const [modo, setModo] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmacao, setConfirmacao] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [mensagem, setMensagem] = useState('');

  function mudarModo(novoModo: Mode) {
    setModo(novoModo);
    setMensagem('');
    setSenha('');
    setConfirmacao('');
  }

  async function enviar() {
    const endereco = email.trim().toLowerCase();
    if (!/^\S+@\S+\.\S+$/.test(endereco)) {
      setMensagem('Informe um e-mail válido.');
      return;
    }
    if (modo !== 'reset' && senha.length < 6) {
      setMensagem('A senha precisa ter pelo menos 6 caracteres.');
      return;
    }
    if (modo === 'register' && senha !== confirmacao) {
      setMensagem('As senhas não coincidem.');
      return;
    }

    setMensagem('');
    setCarregando(true);
    try {
      if (modo === 'register') {
        await createUserWithEmailAndPassword(auth, endereco, senha);
      } else if (modo === 'login') {
        await signInWithEmailAndPassword(auth, endereco, senha);
      } else {
        await sendPasswordResetEmail(auth, endereco);
        Alert.alert('Solicitação recebida', 'Se o e-mail estiver cadastrado, você receberá instruções para redefinir sua senha.');
        mudarModo('login');
      }
    } catch (erro) {
      setMensagem(mensagemErro(erro));
    } finally {
      setCarregando(false);
    }
  }

  return (
    <KeyboardAvoidingView style={styles.tela} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.topo}>
          <View style={styles.icone}><Text style={styles.emoji}>🛒</Text></View>
          <Text style={styles.marca}>Smart<Text style={styles.marcaRealce}>Market</Text></Text>
          <Text style={styles.slogan}>Suas compras mais inteligentes.</Text>
        </View>

        <View style={styles.cartao}>
          <Text style={styles.titulo}>
            {modo === 'login' ? 'Bem-vindo de volta!' : modo === 'register' ? 'Crie sua conta' : 'Recuperar senha'}
          </Text>
          <Text style={styles.subtitulo}>
            {modo === 'login' ? 'Entre e organize suas próximas compras.' : modo === 'register' ? 'Comece a planejar suas compras em minutos.' : 'Enviaremos um link para redefinir sua senha.'}
          </Text>

          <View style={styles.campos}>
            <TextField rotulo="E-mail" placeholder="voce@exemplo.com" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" autoComplete="email" />
            {modo !== 'reset' && (
              <TextField rotulo="Senha" placeholder="Mínimo de 6 caracteres" value={senha} onChangeText={setSenha} secureTextEntry autoCapitalize="none" autoComplete={modo === 'login' ? 'current-password' : 'new-password'} />
            )}
            {modo === 'register' && (
              <TextField rotulo="Confirmar senha" placeholder="Digite a senha novamente" value={confirmacao} onChangeText={setConfirmacao} secureTextEntry autoCapitalize="none" />
            )}
          </View>

          {modo === 'login' && (
            <Pressable onPress={() => mudarModo('reset')} style={styles.esqueci}>
              <Text style={styles.link}>Esqueceu sua senha?</Text>
            </Pressable>
          )}

          {!!mensagem && <Text style={styles.erro} accessibilityRole="alert">{mensagem}</Text>}
          <ActionButton titulo={modo === 'login' ? 'Entrar na minha conta' : modo === 'register' ? 'Criar conta' : 'Enviar e-mail de recuperação'} onPress={enviar} carregando={carregando} />

          <View style={styles.divisor} />
          <Pressable onPress={() => mudarModo(modo === 'login' ? 'register' : 'login')} style={styles.rodape}>
            <Text style={styles.rodapeTexto}>
              {modo === 'login' ? 'Ainda não tem uma conta? ' : modo === 'register' ? 'Já tem uma conta? ' : 'Lembrou a senha? '}
              <Text style={styles.link}>{modo === 'login' ? 'Cadastre-se' : 'Voltar ao login'}</Text>
            </Text>
          </Pressable>
        </View>
        <Text style={styles.nota}>Organize • Economize • Compre melhor</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: colors.background },
  container: { flexGrow: 1, justifyContent: 'center', padding: 22, paddingTop: Platform.OS === 'android' ? 65 : 74, paddingBottom: 30, maxWidth: 500, width: '100%', alignSelf: 'center' },
  topo: { alignItems: 'center', marginBottom: 26 },
  icone: { height: 70, width: 70, backgroundColor: colors.primary, borderRadius: 22, alignItems: 'center', justifyContent: 'center', marginBottom: 13 },
  emoji: { fontSize: 34 },
  marca: { color: colors.text, fontSize: 31, fontWeight: '800', letterSpacing: -1.1 },
  marcaRealce: { color: colors.primary },
  slogan: { color: colors.muted, fontSize: 14, marginTop: 3 },
  cartao: { backgroundColor: colors.surface, padding: 23, borderRadius: 24, borderWidth: 1, borderColor: colors.border, gap: 12 },
  titulo: { fontSize: 23, fontWeight: '800', color: colors.text },
  subtitulo: { color: colors.muted, fontSize: 14, lineHeight: 21, marginBottom: 9 },
  campos: { gap: 15 },
  esqueci: { alignSelf: 'flex-end', paddingVertical: 4 },
  link: { fontSize: 14, fontWeight: '700', color: colors.primary },
  erro: { color: colors.danger, fontSize: 13, lineHeight: 20 },
  divisor: { borderTopWidth: 1, borderColor: colors.border, marginTop: 5 },
  rodape: { paddingVertical: 7 },
  rodapeTexto: { textAlign: 'center', color: colors.muted, fontSize: 14 },
  nota: { marginTop: 24, textAlign: 'center', color: colors.muted, fontSize: 12 },
});
