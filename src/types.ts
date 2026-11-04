import type { Timestamp } from 'firebase/firestore';

export interface ShoppingList {
  id: string;
  nome: string;
  criadoEm?: Timestamp;
}

export interface Product {
  id: string;
  nomeProduto: string;
  quantidade: number;
  precoUnitario: number;
  dataAdicao?: Timestamp;
  comprado: boolean;
}

export type ProductInput = Pick<Product, 'nomeProduto' | 'quantidade' | 'precoUnitario'>;
