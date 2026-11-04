import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ActionButton } from '../components/ActionButton';
import { TextField } from '../components/TextField';
import { criarProduto, editarProduto, excluirProduto, marcarComprado, observarProdutos } from '../services/market';
import { colors } from '../theme';
import type { Product, ShoppingList } from '../types';
import { mensagemErro } from '../utils/errors';
import { formatoQuantidade, lerDecimal, moedaCentavos, totalListaCentavos, totalProdutoCentavos } from '../utils/money';

type Props = { uid: string; lista: ShoppingList; voltar: () => void };

export function ProductsScreen({ uid, lista, voltar }: Props) {
  const [produtos, setProdutos] = useState<Product[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [modalAberto, setModalAberto] = useState(false);
  const [editando, setEditando] = useState<Product | null>(null);
  const [nome, setNome] = useState('');
  const [quantidade, setQuantidade] = useState('1');
  const [preco, setPreco] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [processandoId, setProcessandoId] = useState<string | null>(null);

  useEffect(() => {
    setCarregando(true);
    return observarProdutos(uid, lista.id, (dados) => {
      setProdutos(dados);
      setCarregando(false);
    }, (erro) => {
      setCarregando(false);
      Alert.alert('Erro ao carregar produtos', mensagemErro(erro));
    });
  }, [uid, lista.id]);

  const resumo = useMemo(() => {
    const comprados = produtos.filter((p) => p.comprado);
    return {
      itens: produtos.length,
      unidades: produtos.reduce((s, p) => s + p.quantidade, 0),
      comprados: comprados.length,
      total: totalListaCentavos(produtos),
      gasto: totalListaCentavos(comprados),
    };
  }, [produtos]);

  function abrirFormulario(produto?: Product) {
    setEditando(produto ?? null);
    setNome(produto?.nomeProduto ?? '');
    setQuantidade(produto ? String(produto.quantidade).replace('.', ',') : '1');
    setPreco(produto ? produto.precoUnitario.toFixed(2).replace('.', ',') : '');
    setModalAberto(true);
  }

  async function salvarProduto() {
    const nomeLimpo = nome.trim();
    const qtd = lerDecimal(quantidade);
    const valor = lerDecimal(preco);
    if (!nomeLimpo || nomeLimpo.length > 120) {
      Alert.alert('Nome inválido', 'O nome deve ter de 1 a 120 caracteres.');
      return;
    }
    if (qtd === null || qtd <= 0 || qtd > 1000000) {
      Alert.alert('Quantidade inválida', 'Digite uma quantidade maior que zero.');
      return;
    }
    if (valor === null || valor < 0 || valor > 1000000 || Math.abs(valor * 100 - Math.round(valor * 100)) > 0.000001) {
      Alert.alert('Preço inválido', 'Digite um preço válido, com no máximo duas casas decimais.');
      return;
    }
    const dados = { nomeProduto: nomeLimpo, quantidade: qtd, precoUnitario: Math.round(valor * 100) / 100 };
    setSalvando(true);
    try {
      if (editando) {
        await editarProduto(uid, lista.id, editando.id, dados);
      } else {
        await criarProduto(uid, lista.id, dados);
      }
      setModalAberto(false);
    } catch (erro) {
      Alert.alert('Erro ao salvar produto', mensagemErro(erro));
    } finally {
      setSalvando(false);
    }
  }

  async function alternarComprado(produto: Product) {
    if (processandoId) return;
    setProcessandoId(produto.id);
    try { await marcarComprado(uid, lista.id, produto.id, !produto.comprado); }
    catch (erro) { Alert.alert('Erro ao atualizar', mensagemErro(erro)); }
    finally { setProcessandoId(null); }
  }

  function confirmarExclusao(produto: Product) {
    Alert.alert('Remover produto?', `Deseja excluir "${produto.nomeProduto}" da lista?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Excluir', style: 'destructive', onPress: async () => {
        setProcessandoId(produto.id);
        try { await excluirProduto(uid, lista.id, produto.id); }
        catch (erro) { Alert.alert('Erro ao excluir', mensagemErro(erro)); }
        finally { setProcessandoId(null); }
      } },
    ]);
  }

  return (
    <View style={styles.tela}>
      <View style={styles.cabecalho}>
        <Pressable onPress={voltar} accessibilityRole="button" style={styles.voltar}><Text style={styles.voltarTexto}>‹</Text></Pressable>
        <View style={{ flex: 1 }}>
          <Text style={styles.cabecalhoMini}>MINHA LISTA</Text>
          <Text style={styles.cabecalhoTitulo} numberOfLines={1}>{lista.nome}</Text>
        </View>
        <Pressable onPress={() => abrirFormulario()} accessibilityLabel="Adicionar produto" style={styles.botaoTopo}><Text style={styles.botaoTopoTexto}>＋</Text></Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.conteudo}>
        <View style={styles.totalCartao}>
          <Text style={styles.totalRotulo}>TOTAL ESTIMADO DA COMPRA</Text>
          <Text style={styles.totalValor} adjustsFontSizeToFit numberOfLines={1}>{moedaCentavos(resumo.total)}</Text>
          <View style={styles.totalBarra}>
            <View style={[styles.totalProgresso, { width: `${resumo.itens ? resumo.comprados / resumo.itens * 100 : 0}%` }]} />
          </View>
          <View style={styles.totalDetalhe}>
            <Text style={styles.totalInfo}>{resumo.comprados} de {resumo.itens} itens comprados</Text>
            <Text style={styles.totalInfo}>{moedaCentavos(resumo.gasto)} gastos</Text>
          </View>
        </View>

        <View style={styles.resumoLinha}>
          <View style={styles.resumoMini}><Text style={styles.miniNumero}>{resumo.itens}</Text><Text style={styles.miniLegenda}>Produtos diferentes</Text></View>
          <View style={styles.resumoMini}><Text style={styles.miniNumero}>{formatoQuantidade(resumo.unidades)}</Text><Text style={styles.miniLegenda}>Quantidade total</Text></View>
          <View style={styles.resumoMini}><Text style={styles.miniNumero}>{resumo.comprados}</Text><Text style={styles.miniLegenda}>Comprados</Text></View>
        </View>

        <View style={styles.secaoLinha}>
          <Text style={styles.secaoTitulo}>Produtos da lista</Text>
          <Text style={styles.contador}>{resumo.itens} {resumo.itens === 1 ? 'item' : 'itens'}</Text>
        </View>
        {carregando ? (
          <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 35 }} />
        ) : produtos.length === 0 ? (
          <View style={styles.vazio}>
            <Text style={styles.vazioIcone}>🥬</Text>
            <Text style={styles.vazioTitulo}>Sua lista está vazia</Text>
            <Text style={styles.vazioTexto}>Adicione produtos para acompanhar os custos em tempo real.</Text>
            <ActionButton titulo="＋ Adicionar primeiro produto" onPress={() => abrirFormulario()} style={{ marginTop: 10 }} />
          </View>
        ) : (
          produtos.map((produto) => (
            <View key={produto.id} style={[styles.produto, produto.comprado && styles.produtoComprado]}>
              <Pressable onPress={() => alternarComprado(produto)} disabled={processandoId === produto.id} accessibilityLabel={produto.comprado ? 'Marcar como não comprado' : 'Marcar como comprado'} style={[styles.checkbox, produto.comprado && styles.checkboxAtivo]}>
                {produto.comprado && <Text style={styles.check}>✓</Text>}
              </Pressable>
              <View style={{ flex: 1 }}>
                <Text style={[styles.produtoNome, produto.comprado && styles.riscado]} numberOfLines={2}>{produto.nomeProduto}</Text>
                <Text style={styles.produtoDescricao}>{formatoQuantidade(produto.quantidade)} × {moedaCentavos(Math.round(produto.precoUnitario * 100))}</Text>
                <Text style={[styles.produtoTotal, produto.comprado && { color: colors.muted }]}>{moedaCentavos(totalProdutoCentavos(produto))}</Text>
              </View>
              <View style={styles.produtoAcoes}>
                <Pressable onPress={() => abrirFormulario(produto)} accessibilityLabel={`Editar ${produto.nomeProduto}`} style={styles.acao}><Text style={styles.acaoEditar}>✎</Text></Pressable>
                <Pressable onPress={() => confirmarExclusao(produto)} accessibilityLabel={`Excluir ${produto.nomeProduto}`} style={styles.acao}><Text style={styles.acaoExcluir}>×</Text></Pressable>
              </View>
            </View>
          ))
        )}
        {produtos.length > 0 && <ActionButton titulo="＋ Adicionar produto" variante="secondary" onPress={() => abrirFormulario()} style={{ marginTop: 12 }} />}
        <Text style={styles.nota}>Os valores são atualizados automaticamente e salvos na nuvem.</Text>
      </ScrollView>

      <Modal visible={modalAberto} transparent animationType="slide" onRequestClose={() => { if (!salvando) setModalAberto(false); }}>
        <KeyboardAvoidingView style={styles.modalFundo} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.modalScroll}>
            <View style={styles.modal}>
              <View style={styles.modalCabecalho}>
                <Text style={styles.modalTitulo}>{editando ? 'Editar produto' : 'Adicionar produto'}</Text>
                <Pressable onPress={() => setModalAberto(false)} disabled={salvando} accessibilityLabel="Fechar"><Text style={styles.fechar}>×</Text></Pressable>
              </View>
              <Text style={styles.modalDescricao}>Informe o produto, a quantidade e o preço unitário.</Text>
              <TextField rotulo="Nome do produto *" placeholder="Ex.: Arroz 5 kg" value={nome} onChangeText={setNome} maxLength={120} autoFocus />
              <View style={styles.camposLinha}>
                <View style={{ flex: 1 }}><TextField rotulo="Quantidade *" placeholder="1" value={quantidade} onChangeText={setQuantidade} keyboardType="decimal-pad" /></View>
                <View style={{ flex: 1 }}><TextField rotulo="Preço unitário (R$) *" placeholder="0,00" value={preco} onChangeText={setPreco} keyboardType="decimal-pad" /></View>
              </View>
              <View style={styles.previa}>
                <Text style={styles.previaTexto}>Subtotal do produto</Text>
                <Text style={styles.previaValor}>{moedaCentavos((() => {
                  const q = lerDecimal(quantidade);
                  const p = lerDecimal(preco);
                  return q !== null && p !== null && q > 0 && p >= 0 ? totalProdutoCentavos({ quantidade: q, precoUnitario: p }) : 0;
                })())}</Text>
              </View>
              <ActionButton titulo={editando ? 'Salvar alterações' : 'Adicionar à lista'} onPress={salvarProduto} carregando={salvando} />
              <ActionButton titulo="Cancelar" variante="ghost" onPress={() => setModalAberto(false)} desabilitado={salvando} />
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: colors.background, paddingTop: Platform.OS === 'android' ? 42 : 58 },
  cabecalho: { backgroundColor: 'white', paddingHorizontal: 19, paddingVertical: 13, flexDirection: 'row', alignItems: 'center', gap: 13, borderBottomWidth: 1, borderColor: colors.border },
  voltar: { width: 40, height: 40, borderRadius: 13, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' },
  voltarTexto: { fontSize: 35, lineHeight: 40, color: colors.text },
  cabecalhoMini: { fontSize: 10, letterSpacing: 1.2, color: colors.muted, fontWeight: '800' },
  cabecalhoTitulo: { color: colors.text, fontSize: 19, fontWeight: '800', marginTop: 1 },
  botaoTopo: { height: 39, width: 39, backgroundColor: colors.primary, borderRadius: 13, justifyContent: 'center', alignItems: 'center' },
  botaoTopoTexto: { fontSize: 26, color: 'white', lineHeight: 32 },
  conteudo: { paddingHorizontal: 19, paddingTop: 22, paddingBottom: 65, maxWidth: 680, width: '100%', alignSelf: 'center' },
  totalCartao: { backgroundColor: colors.primary, padding: 23, borderRadius: 22 },
  totalRotulo: { fontSize: 10, color: '#B9E7D6', fontWeight: '800', letterSpacing: 1.1 },
  totalValor: { fontSize: 36, fontWeight: '800', color: 'white', marginTop: 7, marginBottom: 23 },
  totalBarra: { height: 7, borderRadius: 8, backgroundColor: '#4EAC92', overflow: 'hidden' },
  totalProgresso: { height: '100%', backgroundColor: colors.gold, borderRadius: 8 },
  totalDetalhe: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 11, gap: 8 },
  totalInfo: { fontSize: 11, color: '#E3F7E8', fontWeight: '600' },
  resumoLinha: { flexDirection: 'row', gap: 9, marginTop: 13 },
  resumoMini: { flex: 1, backgroundColor: 'white', borderRadius: 16, padding: 13, minHeight: 80, justifyContent: 'center', borderWidth: 1, borderColor: colors.border },
  miniNumero: { fontWeight: '800', fontSize: 19, color: colors.text },
  miniLegenda: { color: colors.muted, fontSize: 10, marginTop: 5, lineHeight: 14 },
  secaoLinha: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 26, marginBottom: 13 },
  secaoTitulo: { fontWeight: '800', fontSize: 18, color: colors.text },
  contador: { color: colors.muted, fontSize: 13 },
  produto: { backgroundColor: 'white', borderRadius: 17, padding: 14, borderWidth: 1, borderColor: colors.border, marginBottom: 10, flexDirection: 'row', alignItems: 'center', gap: 12 },
  produtoComprado: { backgroundColor: '#F1F7F1', opacity: 0.88 },
  checkbox: { height: 25, width: 25, borderRadius: 8, borderWidth: 2, borderColor: '#A1B6A8', justifyContent: 'center', alignItems: 'center' },
  checkboxAtivo: { backgroundColor: colors.primary, borderColor: colors.primary },
  check: { color: 'white', fontWeight: '900', fontSize: 15 },
  produtoNome: { color: colors.text, fontSize: 15, fontWeight: '700' },
  riscado: { textDecorationLine: 'line-through', color: colors.muted },
  produtoDescricao: { color: colors.muted, marginTop: 4, fontSize: 12 },
  produtoTotal: { color: colors.primary, fontWeight: '800', fontSize: 15, marginTop: 5 },
  produtoAcoes: { gap: 5 },
  acao: { width: 30, height: 30, borderRadius: 9, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' },
  acaoEditar: { fontSize: 18, color: colors.primary },
  acaoExcluir: { fontSize: 23, color: colors.danger, lineHeight: 27 },
  vazio: { padding: 24, paddingVertical: 36, borderRadius: 18, borderWidth: 1, borderColor: colors.border, backgroundColor: 'white', alignItems: 'center', gap: 8 },
  vazioIcone: { fontSize: 37 },
  vazioTitulo: { fontSize: 17, fontWeight: '800', color: colors.text },
  vazioTexto: { fontSize: 13, textAlign: 'center', color: colors.muted, lineHeight: 20 },
  nota: { textAlign: 'center', color: colors.muted, fontSize: 11, marginTop: 25, lineHeight: 18 },
  modalFundo: { flex: 1, backgroundColor: 'rgba(9,30,22,.52)' },
  modalScroll: { flexGrow: 1, justifyContent: 'flex-end' },
  modal: { width: '100%', alignSelf: 'center', maxWidth: 680, backgroundColor: 'white', padding: 22, paddingBottom: Platform.OS === 'ios' ? 39 : 26, borderTopLeftRadius: 25, borderTopRightRadius: 25, gap: 15 },
  modalCabecalho: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  modalTitulo: { fontSize: 22, fontWeight: '800', color: colors.text },
  modalDescricao: { color: colors.muted, fontSize: 13, marginBottom: 3 },
  fechar: { fontSize: 30, color: colors.muted },
  camposLinha: { flexDirection: 'row', gap: 12 },
  previa: { borderRadius: 14, backgroundColor: colors.primaryLight, padding: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 10 },
  previaTexto: { color: colors.primaryDark, fontSize: 13 },
  previaValor: { color: colors.primaryDark, fontWeight: '800', fontSize: 18 },
});
