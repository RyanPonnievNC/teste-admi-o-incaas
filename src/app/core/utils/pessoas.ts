// Procura nomes de pessoas em um texto (primeiros nomes comuns e pessoas conhecidas).
// Não usa internet: só reconhece o que está nas listas de data/nomes.ts.

import {
  NOMES_AMBIGUOS,
  PESSOAS_PUBLICAS,
  PRIMEIROS_NOMES,
  SOBRENOMES,
  type TipoPessoa
} from '../data/nomes';

export interface PessoaCitada {
  nome: string;
  tipo: TipoPessoa;
}

interface Palavra {
  bruto: string;     // como o usuário digitou, com pontuação
  original: string;  // sem pontuação nas pontas
  limpa: string;     // minúscula, sem acento e sem símbolos
  usada: boolean;
}

const CONECTORES = new Set(['de', 'da', 'do', 'das', 'dos']);

function normalizar(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
}

// Quantas letras precisam mudar para uma palavra virar a outra.
function distancia(a: string, b: string): number {
  let anterior = Array.from({ length: b.length + 1 }, (_, j) => j);

  for (let i = 1; i <= a.length; i++) {
    const atual = [i];

    for (let j = 1; j <= b.length; j++) {
      const custo = a[i - 1] === b[j - 1] ? 0 : 1;
      atual[j] = Math.min(anterior[j] + 1, atual[j - 1] + 1, anterior[j - 1] + custo);
    }

    anterior = atual;
  }

  return anterior[b.length];
}

// Aceita pequenos erros de digitação em palavras de 5 letras ou mais.
function parecido(palavra: string, alvo: string): boolean {
  if (palavra === alvo) {
    return true;
  }

  const tamanho = Math.max(palavra.length, alvo.length);

  if (tamanho <= 4) {
    return false;
  }

  return distancia(palavra, alvo) <= (tamanho <= 8 ? 1 : 2);
}

function iniciaComMaiuscula(texto: string): boolean {
  const primeira = texto.charAt(0);
  return primeira !== primeira.toLowerCase();
}

function pareceSobrenome(palavra: Palavra): boolean {
  return (
    SOBRENOMES.has(palavra.limpa) ||
    (iniciaComMaiuscula(palavra.original) && palavra.limpa.length >= 3)
  );
}

function terminaFrase(palavra: Palavra): boolean {
  return /[.,;:!?]$/.test(palavra.bruto);
}

function embelezar(palavras: Palavra[]): string {
  return palavras
    .map(p =>
      CONECTORES.has(p.limpa)
        ? p.original.toLowerCase()
        : p.original.charAt(0).toUpperCase() + p.original.slice(1)
    )
    .join(' ');
}

export function identificarPessoas(texto: string): PessoaCitada[] {
  const palavras: Palavra[] = texto
    .split(/\s+/)
    .map(bruto => ({
      bruto,
      original: bruto.replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, ''),
      limpa: normalizar(bruto),
      usada: false
    }))
    .filter(p => p.limpa.length > 0);

  const encontradas: { inicio: number; pessoa: PessoaCitada }[] = [];

  // 1) Pessoas conhecidas (aceita erros de digitação)
  for (const figura of PESSOAS_PUBLICAS) {
    const apelidos = [...figura.apelidos].sort(
      (a, b) => b.split(' ').length - a.split(' ').length
    );

    for (const apelido of apelidos) {
      const alvo = apelido.split(' ');

      for (let i = 0; i + alvo.length <= palavras.length; i++) {
        const trecho = palavras.slice(i, i + alvo.length);

        if (trecho.some(p => p.usada)) {
          continue;
        }

        if (trecho.every((p, k) => parecido(p.limpa, alvo[k]))) {
          trecho.forEach(p => (p.usada = true));
          encontradas.push({ inicio: i, pessoa: { nome: figura.nome, tipo: 'publica' } });
        }
      }
    }
  }

  // 2) Nomes comuns, com sobrenomes logo depois (ex.: "joão da silva")
  for (let i = 0; i < palavras.length; i++) {
    const primeira = palavras[i];

    if (primeira.usada || !PRIMEIROS_NOMES.has(primeira.limpa)) {
      continue;
    }

    if (NOMES_AMBIGUOS.has(primeira.limpa) && !iniciaComMaiuscula(primeira.original)) {
      continue;
    }

    let fim = i;

    while (fim + 1 < palavras.length && fim - i < 4 && !terminaFrase(palavras[fim])) {
      const proxima = palavras[fim + 1];

      if (proxima.usada) {
        break;
      }

      if (CONECTORES.has(proxima.limpa)) {
        const depois = palavras[fim + 2];

        if (depois && !depois.usada && pareceSobrenome(depois)) {
          fim += 2;
          continue;
        }

        break;
      }

      if (pareceSobrenome(proxima)) {
        fim += 1;
        continue;
      }

      break;
    }

    const trecho = palavras.slice(i, fim + 1);
    trecho.forEach(p => (p.usada = true));
    encontradas.push({ inicio: i, pessoa: { nome: embelezar(trecho), tipo: 'comum' } });
  }

  // Na ordem em que aparecem no texto, sem repetir
  const vistos = new Set<string>();

  return encontradas
    .sort((a, b) => a.inicio - b.inicio)
    .map(e => e.pessoa)
    .filter(p => {
      const chave = p.nome.toLowerCase();
      return vistos.has(chave) ? false : (vistos.add(chave), true);
    });
}
