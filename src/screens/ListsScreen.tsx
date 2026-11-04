import React, { useEffect, useState } from 'react';
import { Alert, ActivityIndicator, FlatList, Modal, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { signOut, type User } from 'firebase/auth';
import { ActionButton } from '../components/ActionButton';
import { TextField } from '../components/TextField';
import { auth } from '../config/firebase';
import { criarLista, excluirLista, observarListas, renomearLista } from '../services/market';
import { colors } from '../theme';
import type { ShoppingList } from '../types';
import { mensagemErro } from '../utils/errors';

type Props = { usuario: User; abrirLista: (lista: ShoppingList) => void };

export function ListsScreen({ usuario, abrirLista }: Props) {
  const [listas, setListas] = useState<ShoppingList[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [modalAberto, setModalAberto] = useState(false);
  const [editando, setEditando] = useState<ShoppingList | null>(null);
  const [nome, setNome] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [excluindo, setExcluindo] = useState<string | null>(null);

  useEffect(() => {
    setCarregando(true);
    return observarListas(usuario.uid, (dados) => {
      setListas(dados);
      setCarregando(false);
    }, (erro) => {
      setCarregando(false);
      Alert.alert('Erro ao carregar listas', mensagemErro(erro));
    });
  }, [usuario.uid]);

  function abrirFormulario(lista?: ShoppingList) {
    setEditando(lista ?? null);
    setNome(lista?.nome ?? '');
    setModalAberto(true);
  }

  async function salvar() {
    const valor = nome.trim();
    if (!valor || valor.length > 80) {
      Alert.alert('Nome inválido', 'Informe um nome entre 1 e 80 caracteres.');
      return;
    }
    setSalvando(true);
    try {
      if (editando) {
        await renomearLista(usuario.uid, editando.id, valor);
      } else {
        await criarLista(usuario.uid, valor);
      }
      setModalAberto(false);
    } catch (erro) {
      Alert.alert('Não foi possível salvar', mensagemErro(erro));
    } finally {
      setSalvando(false);
    }
  }

  function confirmarExclusao(lista: ShoppingList) {
    Alert.alert('Excluir lista?', `Todos os produtos de "${lista.nome}" serão excluídos definitivamente.`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Excluir', style: 'destructive', onPress: async () => {
        setExcluindo(lista.id);
        try { await excluirLista(usuario.uid, lista.id); }
        catch (erro) { Alert.alert('Erro ao excluir', mensagemErro(erro)); }
        finally { setExcluindo(null); }
      } },
    ]);
  }

  async function sair() {
    try { await signOut(auth); }
    catch (erro) { Alert.alert('Erro ao sair', mensagemErro(erro)); }
  }

  return (
    <View style={styles.tela}>
      <View style={styles.cabecalho}>
        <View style={styles.marcaLinha}>
          <View style={styles.marcaIcone}><Text style={{ fontSize: 20 }}>🛒</Text></View>
          <Text style={styles.marca}>Smart<Text style={{ color: colors.primary }}>Market</Text></Text>
        </View>
        <Pressable accessibilityRole="button" onPress={sair} style={styles.sair}><Text style={styles.sairTexto}>Sair</Text></Pressable>
      </View>

      <FlatList
        data={listas}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.conteudo}
        ListHeaderComponent={
          <>
            <Text style={styles.saudacao}>Olá, {usuario.email?.split('@')[0] || 'comprador'} 👋</Text>
            <Text style={styles.subtitulo}>Tudo pronto para a próxima compra?</Text>
            <View style={styles.banner}>
              <View>
                <Text style={styles.bannerPequeno}>SEU PLANEJAMENTO</Text>
                <Text style={styles.bannerNumero}>{listas.length}</Text>
                <Text style={styles.bannerTexto}>{listas.length === 1 ? 'lista organizada' : 'listas organizadas'}</Text>
              </View>
              <Text style={styles.bannerEmoji}>🛍️</Text>
            </View>
            <View style={styles.secaoCabecalho}>
              <Text style={styles.secaoTitulo}>Minhas listas</Text>
              <Pressable onPress={() => abrirFormulario()} accessibilityRole="button"><Text style={styles.adicionar}>＋ Nova lista</Text></Pressable>
            </View>
          </>
        }
        ListEmptyComponent={carregando ? (
          <ActivityIndicator style={{ marginTop: 44 }} color={colors.primary} size="large" />
        ) : (
          <View style={styles.vazio}>
            <Text style={styles.vazioEmoji}>📝</Text>
            <Text style={styles.vazioTitulo}>Nenhuma lista por enquanto</Text>
            <Text style={styles.vazioTexto}>Crie uma lista para organizar seus produtos e controlar o valor da compra.</Text>
            <ActionButton titulo="Criar minha primeira lista" onPress={() => abrirFormulario()} style={{ marginTop: 10 }} />
          </View>
        )}
        renderItem={({ item }) => (
          <Pressable onPress={() => abrirLista(item)} style={({ pressed }) => [styles.lista, pressed && { opacity: 0.7 }]}>
            <View style={styles.listaIcone}><Text style={{ fontSize: 21 }}>🧺</Text></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.listaNome} numberOfLines={1}>{item.nome}</Text>
              <Text style={styles.listaData}>{item.criadoEm?.toDate ? `Criada em ${item.criadoEm.toDate().toLocaleDateString('pt-BR')}` : 'Lista de compras'}</Text>
            </View>
            <Pressable onPress={() => abrirFormulario(item)} accessibilityLabel={`Editar ${item.nome}`} style={styles.acao}><Text style={styles.acaoTexto}>✎</Text></Pressable>
            <Pressable onPress={() => confirmarExclusao(item)} disabled={excluindo === item.id} accessibilityLabel={`Excluir ${item.nome}`} style={styles.acao}>
              <Text style={[styles.acaoTexto, { color: colors.danger }]}>{excluindo === item.id ? '…' : '×'}</Text>
            </Pressable>
            <Text style={styles.chevron}>›</Text>
          </Pressable>
        )}
      />

      <Modal visible={modalAberto} transparent animationType="fade" onRequestClose={() => { if (!salvando) setModalAberto(false); }}>
        <View style={styles.sombraModal}>
          <View style={styles.modal}>
            <Text style={styles.modalTitulo}>{editando ? 'Renomear lista' : 'Nova lista de compras'}</Text>
            <Text style={styles.modalDescricao}>Dê um nome para encontrar sua lista facilmente.</Text>
            <TextField rotulo="Nome da lista" placeholder="Ex.: Compras do mês" value={nome} onChangeText={setNome} maxLength={80} autoFocus />
            <View style={styles.botoesModal}>
              <ActionButton titulo="Cancelar" variante="secondary" onPress={() => setModalAberto(false)} desabilitado={salvando} style={{ flex: 1 }} />
              <ActionButton titulo="Salvar" onPress={salvar} carregando={salvando} style={{ flex: 1 }} />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: colors.background, paddingTop: Platform.OS === 'android' ? 42 : 58 },
  cabecalho: { paddingHorizontal: 22, paddingBottom: 16, backgroundColor: colors.surface, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderColor: colors.border },
  marcaLinha: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  marcaIcone: { width: 38, height: 38, borderRadius: 12, backgroundColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  marca: { fontSize: 21, fontWeight: '800', color: colors.text, letterSpacing: -0.6 },
  sair: { paddingHorizontal: 14, paddingVertical: 9, borderRadius: 12, backgroundColor: colors.background },
  sairTexto: { fontWeight: '700', color: colors.muted, fontSize: 13 },
  conteudo: { paddingHorizontal: 22, paddingTop: 25, paddingBottom: 60, flexGrow: 1, maxWidth: 680, width: '100%', alignSelf: 'center' },
  saudacao: { fontSize: 23, fontWeight: '800', color: colors.text },
  subtitulo: { fontSize: 14, color: colors.muted, marginTop: 4, marginBottom: 21 },
  banner: { backgroundColor: colors.primary, borderRadius: 22, padding: 23, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 29 },
  bannerPequeno: { fontSize: 10, color: '#B9E7D6', fontWeight: '800', letterSpacing: 1.5 },
  bannerNumero: { fontSize: 43, fontWeight: '800', color: 'white', marginTop: 9 },
  bannerTexto: { fontSize: 14, color: '#E4F7EB' },
  bannerEmoji: { fontSize: 55 },
  secaoCabecalho: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  secaoTitulo: { fontSize: 19, fontWeight: '800', color: colors.text },
  adicionar: { color: colors.primary, fontWeight: '800', fontSize: 14 },
  lista: { backgroundColor: colors.surface, borderRadius: 18, padding: 15, marginBottom: 11, flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1, borderColor: colors.border },
  listaIcone: { width: 44, height: 44, backgroundColor: colors.primaryLight, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  listaNome: { fontWeight: '700', fontSize: 15, color: colors.text },
  listaData: { color: colors.muted, fontSize: 12, marginTop: 4 },
  acao: { padding: 5, minWidth: 25, alignItems: 'center' },
  acaoTexto: { color: colors.primary, fontSize: 20, fontWeight: '600' },
  chevron: { color: colors.muted, fontSize: 24 },
  vazio: { padding: 25, paddingVertical: 37, backgroundColor: 'white', borderRadius: 18, alignItems: 'center', gap: 7, borderWidth: 1, borderColor: colors.border },
  vazioEmoji: { fontSize: 35 },
  vazioTitulo: { fontSize: 17, color: colors.text, fontWeight: '800', textAlign: 'center' },
  vazioTexto: { color: colors.muted, lineHeight: 20, textAlign: 'center', fontSize: 13 },
  sombraModal: { flex: 1, backgroundColor: 'rgba(6,26,19,.43)', alignItems: 'center', justifyContent: 'center', padding: 22 },
  modal: { width: '100%', maxWidth: 450, borderRadius: 22, backgroundColor: 'white', padding: 22, gap: 14 },
  modalTitulo: { fontWeight: '800', fontSize: 21, color: colors.text },
  modalDescricao: { color: colors.muted, fontSize: 14, lineHeight: 20 },
  botoesModal: { flexDirection: 'row', gap: 10, marginTop: 8 },
});
