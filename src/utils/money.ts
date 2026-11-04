import type { Product } from '../types';

const brl = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

/** Usa centavos como unidade de soma para evitar acúmulo de erro de ponto flutuante. */
export function totalProdutoCentavos(produto: Pick<Product, 'quantidade' | 'precoUnitario'>): number {
  const precoCentavos = Math.round(produto.precoUnitario * 100);
  return Math.round(produto.quantidade * precoCentavos);
}

export function totalListaCentavos(produtos: Pick<Product, 'quantidade' | 'precoUnitario'>[]): number {
  return produtos.reduce((total, produto) => total + totalProdutoCentavos(produto), 0);
}

export function moedaCentavos(centavos: number): string {
  return brl.format(centavos / 100);
}

export function moeda(valor: number): string {
  return moedaCentavos(Math.round(valor * 100));
}

export function lerDecimal(texto: string): number | null {
  const limpo = texto.trim().replace(/\s/g, '');
  if (!limpo) return null;
  const normalizado = limpo.includes(',')
    ? limpo.replace(/\./g, '').replace(',', '.')
    : limpo;
  if (!/^\d+(\.\d+)?$/.test(normalizado)) return null;
  const valor = Number(normalizado);
  return Number.isFinite(valor) ? valor : null;
}

export function formatoQuantidade(quantidade: number): string {
  return new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 3 }).format(quantidade);
}
