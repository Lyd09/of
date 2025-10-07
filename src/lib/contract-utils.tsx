"use client";

import React from 'react';

/**
 * Envolve termos específicos de um texto com a tag <strong>.
 * @param text O texto a ser processado.
 * @param terms As palavras-chave para colocar em negrito.
 * @returns Um array de elementos React com os termos em negrito.
 */
export const boldenContractTerms = (text: string, terms: string[]): React.ReactNode[] => {
  if (!text) return [];

  const regex = new RegExp(`\\b(${terms.join('|')})\\b`, 'gi');
  const parts = text.split(regex);

  return parts.map((part, index) => {
    const isTerm = terms.some(term => new RegExp(`^${term}$`, 'i').test(part));
    if (isTerm) {
      return <strong key={index}>{part}</strong>;
    }
    return part;
  });
};
