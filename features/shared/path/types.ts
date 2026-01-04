/**
 * Branded Type パターン
 * 構造的には同じ型だが、型システム上で区別される
 */
export type Branded<T, Brand> = T & { readonly __brand: Brand };
