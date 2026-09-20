/**
 * Normaliza um texto removendo acentos (diacríticos), pontuações irrelevantes e convertendo para minúsculas.
 */
export function normalizeText(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}
