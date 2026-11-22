// Procura nomes de pessoas em um texto (primeiros nomes comuns e pessoas conhecidas).
// Também tenta descobrir o papel de cada um (autor, réu, testemunha) pelas palavras ao redor.
// Não usa internet: só reconhece o que está nas listas de data/nomes.ts.

import {
  NOMES_AMBIGUOS,
  PESSOAS_PUBLICAS,
  PRIMEIROS_NOMES,
  SOBRENOMES,
  type TipoPessoa
} from '../data/nomes';

// Papel da pessoa no processo. "citado" = a IA não achou pistas no texto.
export type PapelPessoa = 'autor' | 'reu' | 'testemunha' | 'citado';

export interface PessoaCitada {
  nome: string;
  tipo: TipoPessoa;
  papel: PapelPessoa;
}

interface Palavra {
  bruto: string;     // como o usuário digitou, com pontuação
  original: string;  // sem pontuação nas pontas
  limpa: string;     // minúscula, sem acento e sem símbolos
  usada: boolean;
}

const CONECTORES = new Set(['de', 'da', 'do', 'das', 'dos']);

// Palavras que indicam o papel da pessoa (já sem acento e em minúsculas).
// ANTES = a pista vem antes do nome ("movida por Fulano", "contra Fulano").
const ANTES: Record<Exclude<PapelPessoa, 'citado'>, Set<string>> = {
  autor: new Set([
    'movida', 'movido', 'ajuizada', 'ajuizado', 'proposta', 'proposto', 'ingressada', 'ingressado',
    'autor', 'autora', 'autores', 'autoras', 'requerente', 'requerentes', 'reclamante', 'reclamantes',
    'demandante', 'demandantes', 'exequente', 'impetrante'
  ]),
  reu: new Set([
    'contra', 'processou', 'processa', 'processaram', 'acionou', 'demandou',
    'reu', 'reus', 're', 'res', 'requerido', 'requerida', 'requeridos', 'requeridas',
    'reclamado', 'reclamada', 'reclamados', 'demandado', 'demandada', 'executado', 'executada',
    'acusado', 'acusada', 'denunciado', 'denunciada'
  ]),
  testemunha: new Set(['testemunha', 'testemunhas', 'informante'])
};

// Verbos logo depois do nome que indicam quem move a ação ("Fulano processou", "Fulano pede").
const VERBOS_DO_AUTOR = new Set([
  'processou', 'processa', 'pede', 'pediu', 'requer', 'requereu', 'ajuizou', 'move', 'moveu',
  'propoe', 'propos', 'ingressou', 'reclama', 'reclamou'
]);

// Palavras de ligação ("como", "são", "foi", "é"...). Depois do nome, o papel só vale
// se uma delas vier antes (ex.: "Fulano foi citado como testemunha", "Fulano é o autor").
const LIGACOES = new Set(['como', 'sao', 'foram', 'foi', 'sera', 'serao', 'e']);

// Verbos logo depois do nome que indicam testemunha ("Fulano testemunhou", "Fulano depôs").
const VERBOS_DA_TESTEMUNHA = new Set([
  'testemunhou', 'testemunharam', 'depoe', 'depos', 'depuseram', 'presenciou', 'presenciaram'
]);

// "foi processado por Fulano": quem vem depois do "por" é quem move a ação.
const PARTICIPIOS_DO_REU = new Set([
  'processado', 'processada', 'processados', 'processadas',
  'demandado', 'demandada', 'demandados', 'demandadas',
  'acionado', 'acionada', 'acionados', 'acionadas',
  'acusado', 'acusada', 'acusados', 'acusadas',
  'denunciado', 'denunciada', 'denunciados', 'denunciadas'
]);

// Palavras que dizem o papel DEPOIS do nome: "Fulano, réu,", "Fulano (autora)",
// "Fulano é o autor", "Fulano foi acusado".
const NOMES_DEPOIS: Record<Exclude<PapelPessoa, 'citado'>, Set<string>> = {
  autor: new Set([
    'autor', 'autora', 'autores', 'autoras', 'requerente', 'requerentes',
    'reclamante', 'reclamantes', 'demandante', 'demandantes', 'exequente', 'impetrante'
  ]),
  reu: new Set([
    'reu', 'reus', 're', 'res', 'requerido', 'requerida', 'requeridos', 'requeridas',
    'reclamado', 'reclamada', 'reclamados', 'reclamadas',
    'demandado', 'demandada', 'demandados', 'demandadas',
    'executado', 'executada', 'acusado', 'acusada', 'acusados', 'acusadas',
    'denunciado', 'denunciada', 'processado', 'processada', 'processados', 'processadas'
  ]),
  testemunha: new Set(['testemunha', 'testemunhas', 'informante'])
};

const PAPEIS = ['autor', 'reu', 'testemunha'] as const;

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

// O conectivo "e" (Ana e Bia), e não o verbo "é" (Ana é ré).
function ehConectivoE(palavra: Palavra): boolean {
  return palavra.limpa === 'e' && palavra.original.toLowerCase() !== 'é';
}

// Pistas coladas ao nome, que valem mais que as palavras mais distantes:
//   "Fulano processou ...", "Fulano testemunhou ...",
//   "Fulano, réu, ...", "Fulano (autora) ...", "Fulano, autor da ação, ..."
function papelColado(palavras: Palavra[], fim: number): PapelPessoa | null {
  const ultima = palavras[fim];
  const proxima = palavras[fim + 1];

  if (!proxima || proxima.usada || /[.;]$/.test(ultima.bruto)) {
    return null;
  }

  if (VERBOS_DO_AUTOR.has(proxima.limpa)) {
    return 'autor';
  }

  if (VERBOS_DA_TESTEMUNHA.has(proxima.limpa)) {
    return 'testemunha';
  }

  // Aposto: o papel vem logo depois de uma vírgula ou entre parênteses.
  if (/,$/.test(ultima.bruto) || proxima.bruto.startsWith('(')) {
    for (const papel of PAPEIS) {
      if (NOMES_DEPOIS[papel].has(proxima.limpa)) {
        return papel;
      }
    }
  }

  return null;
}

// Procura uma pista de papel perto do nome. Para quando a frase termina (. ou ;).
function papelPorPistas(
  palavras: Palavra[],
  inicio: number,
  fim: number
): PapelPessoa {
  // 0) Pistas coladas ao nome (verbo logo depois, ou aposto entre vírgulas/parênteses).
  const colado = papelColado(palavras, fim);

  if (colado) {
    return colado;
  }

  // 1) Pistas antes do nome. Pula "e" e outros nomes (lista: "contra Ana e Bia").
  let vistas = 0;

  for (let k = inicio - 1; k >= 0 && vistas < 3; k--) {
    const p = palavras[k];

    if (/[.;]$/.test(p.bruto)) {
      break;
    }

    if (p.usada || ehConectivoE(p)) {
      continue;
    }

    // Palavra com vírgula ou parêntese (ex.: "testemunha," ou "(autora)") pertence ao nome anterior.
    if (/[,)]$/.test(p.bruto)) {
      break;
    }

    // "foi processado por Fulano": Fulano é quem move a ação.
    if (p.limpa === 'por' && k > 0 && PARTICIPIOS_DO_REU.has(palavras[k - 1].limpa)) {
      return 'autor';
    }

    for (const papel of PAPEIS) {
      if (ANTES[papel].has(p.limpa)) {
        return papel;
      }
    }

    vistas++;
  }

  // 2) Pistas depois do nome (e depois da lista de nomes, se houver).
  let k = fim;

  while (true) {
    if (/[.;]$/.test(palavras[k].bruto) || k + 1 >= palavras.length) {
      return 'citado';
    }

    k++;

    if (!palavras[k].usada && !ehConectivoE(palavras[k])) {
      break;
    }
  }

  // Verbo logo depois do nome: "Fulano processou ...", "Fulano pede ..."
  if (VERBOS_DO_AUTOR.has(palavras[k].limpa)) {
    return 'autor';
  }

  // "como testemunha", "são réus", "é o autor"... até 5 palavras depois, sem passar de vírgula ou ponto.
  let ligou = false;

  for (let n = 0; n < 5 && k < palavras.length; n++, k++) {
    const p = palavras[k];

    if (ligou) {
      for (const papel of PAPEIS) {
        if (NOMES_DEPOIS[papel].has(p.limpa)) {
          return papel;
        }
      }
    }

    if (LIGACOES.has(p.limpa)) {
      ligou = true;
    }

    if (/[.;,]$/.test(p.bruto)) {
      break;
    }
  }

  return 'citado';
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

  const encontradas: { inicio: number; fim: number; pessoa: PessoaCitada }[] = [];

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
          encontradas.push({
            inicio: i,
            fim: i + alvo.length - 1,
            pessoa: { nome: figura.nome, tipo: 'publica', papel: 'citado' }
          });
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
    encontradas.push({
      inicio: i,
      fim,
      pessoa: { nome: embelezar(trecho), tipo: 'comum', papel: 'citado' }
    });
  }

  // Agora que todos os nomes estão marcados, descobre o papel de cada um.
  for (const e of encontradas) {
    e.pessoa.papel = papelPorPistas(palavras, e.inicio, e.fim);
  }

  // Na ordem em que aparecem no texto, sem repetir (se repetir, vale o papel que tiver pista)
  const vistos = new Map<string, PessoaCitada>();

  for (const e of encontradas.sort((a, b) => a.inicio - b.inicio)) {
    const chave = e.pessoa.nome.toLowerCase();
    const anterior = vistos.get(chave);

    if (!anterior) {
      vistos.set(chave, e.pessoa);
    } else if (anterior.papel === 'citado') {
      anterior.papel = e.pessoa.papel;
    }
  }

  return [...vistos.values()];
}