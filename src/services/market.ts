import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  writeBatch,
  type Unsubscribe,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import type { Product, ProductInput, ShoppingList } from '../types';

function listasRef(uid: string) {
  return collection(db, 'usuarios', uid, 'listas');
}
function listaRef(uid: string, listaId: string) {
  return doc(db, 'usuarios', uid, 'listas', listaId);
}
function produtosRef(uid: string, listaId: string) {
  return collection(db, 'usuarios', uid, 'listas', listaId, 'produtos');
}
function produtoRef(uid: string, listaId: string, produtoId: string) {
  return doc(db, 'usuarios', uid, 'listas', listaId, 'produtos', produtoId);
}

export function observarListas(
  uid: string,
  atualizar: (listas: ShoppingList[]) => void,
  falha: (erro: Error) => void,
): Unsubscribe {
  return onSnapshot(query(listasRef(uid), orderBy('criadoEm', 'desc')), (snapshot) => {
    atualizar(snapshot.docs.map((item) => ({ id: item.id, ...(item.data() as Omit<ShoppingList, 'id'>) })));
  }, falha);
}

export function observarProdutos(
  uid: string,
  listaId: string,
  atualizar: (produtos: Product[]) => void,
  falha: (erro: Error) => void,
): Unsubscribe {
  return onSnapshot(query(produtosRef(uid, listaId), orderBy('dataAdicao', 'desc')), (snapshot) => {
    atualizar(snapshot.docs.map((item) => ({ id: item.id, ...(item.data() as Omit<Product, 'id'>) })));
  }, falha);
}

export function criarLista(uid: string, nome: string) {
  return addDoc(listasRef(uid), { nome: nome.trim(), criadoEm: serverTimestamp() });
}
export function renomearLista(uid: string, id: string, nome: string) {
  return updateDoc(listaRef(uid, id), { nome: nome.trim() });
}

/** Excluir documento pai não exclui subcoleções: remover produtos antes da lista. */
export async function excluirLista(uid: string, id: string) {
  const ref = produtosRef(uid, id);
  // Limite inferior a 500 operações para respeitar o tamanho máximo de um batch.
  while (true) {
    const pagina = await getDocs(query(ref, limit(400)));
    if (pagina.empty) break;
    const batch = writeBatch(db);
    pagina.docs.forEach((produto) => batch.delete(produto.ref));
    await batch.commit();
  }
  await deleteDoc(listaRef(uid, id));
}

export function criarProduto(uid: string, listaId: string, produto: ProductInput) {
  return addDoc(produtosRef(uid, listaId), {
    ...produto,
    comprado: false,
    dataAdicao: serverTimestamp(),
  });
}
export function editarProduto(uid: string, listaId: string, produtoId: string, produto: ProductInput) {
  return updateDoc(produtoRef(uid, listaId, produtoId), produto);
}
export function marcarComprado(uid: string, listaId: string, produtoId: string, comprado: boolean) {
  return updateDoc(produtoRef(uid, listaId, produtoId), { comprado });
}
export function excluirProduto(uid: string, listaId: string, produtoId: string) {
  return deleteDoc(produtoRef(uid, listaId, produtoId));
}
