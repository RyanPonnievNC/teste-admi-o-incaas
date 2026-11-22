// Nomes extras para a IA reconhecer. Tudo em minúsculas e sem acentos.
// Este arquivo só guarda dados; quem junta tudo com as listas originais é o nomes.ts.

import type { PessoaPublica } from './nomes';

// "apelidos" = formas como a pessoa pode ser escrita. Evite apelidos de uma só
// palavra que também sejam nome comum (ex.: "luciano"), senão qualquer
// "Luciano" vira famoso.
export const PESSOAS_EXTRAS: PessoaPublica[] = [
  // Brasil: criadores de conteúdo e streamers
  { nome: 'Felipe Neto', apelidos: ['felipe neto'] },
  { nome: 'Luccas Neto', apelidos: ['luccas neto', 'lucas neto'] },
  { nome: 'Whindersson Nunes', apelidos: ['whindersson nunes', 'whindersson', 'windersson'] },
  { nome: 'Casimiro', apelidos: ['casimiro', 'casimiro miguel'] },
  { nome: 'Gaules', apelidos: ['gaules'] },
  { nome: 'Alanzoka', apelidos: ['alanzoka'] },
  { nome: 'Cellbit', apelidos: ['cellbit'] },
  { nome: 'Carlinhos Maia', apelidos: ['carlinhos maia'] },
  { nome: 'Virginia Fonseca', apelidos: ['virginia fonseca', 'virginia'] },
  { nome: 'Bianca Andrade', apelidos: ['bianca andrade', 'boca rosa'] },
  { nome: 'Juliette Freire', apelidos: ['juliette freire', 'juliette'] },
  { nome: 'Gkay', apelidos: ['gkay'] },
  { nome: 'Rafa Kalimann', apelidos: ['rafa kalimann'] },
  { nome: 'Jout Jout', apelidos: ['jout jout'] },
  { nome: 'Luva de Pedreiro', apelidos: ['luva de pedreiro'] },
  { nome: 'Primo Rico', apelidos: ['primo rico', 'thiago nigro'] },
  { nome: 'Átila Iamarino', apelidos: ['atila iamarino'] },
  { nome: 'Rezendeevil', apelidos: ['rezendeevil', 'rezende evil'] },
  { nome: 'Tirullipa', apelidos: ['tirullipa'] },
  { nome: 'Kondzilla', apelidos: ['kondzilla', 'konrad dantas'] },
  { nome: 'Júlio Cocielo', apelidos: ['julio cocielo', 'cocielo'] },
  { nome: 'Christian Figueiredo', apelidos: ['christian figueiredo'] },

  // Brasil: TV, música e esporte
  { nome: 'Anitta', apelidos: ['anitta'] },
  { nome: 'Neymar', apelidos: ['neymar', 'neymar jr'] },
  { nome: 'Xuxa', apelidos: ['xuxa'] },
  { nome: 'Silvio Santos', apelidos: ['silvio santos'] },
  { nome: 'Faustão', apelidos: ['faustao', 'fausto silva'] },
  { nome: 'Luciano Huck', apelidos: ['luciano huck'] },
  { nome: 'Ivete Sangalo', apelidos: ['ivete sangalo'] },
  { nome: 'Maisa Silva', apelidos: ['maisa silva'] },

  // Internacional: internet
  { nome: 'MrBeast', apelidos: ['mrbeast', 'mr beast', 'jimmy donaldson'] },
  { nome: 'PewDiePie', apelidos: ['pewdiepie', 'pewds', 'felix kjellberg'] },
  { nome: 'Markiplier', apelidos: ['markiplier'] },
  { nome: 'Kai Cenat', apelidos: ['kai cenat'] },
  { nome: 'IShowSpeed', apelidos: ['ishowspeed'] },
  { nome: 'Charli D\'Amelio', apelidos: ['charli damelio'] },
  { nome: 'Addison Rae', apelidos: ['addison rae'] },
  { nome: 'Logan Paul', apelidos: ['logan paul'] },
  { nome: 'Jake Paul', apelidos: ['jake paul'] },
  { nome: 'KSI', apelidos: ['ksi'] },
  { nome: 'Pokimane', apelidos: ['pokimane'] },
  { nome: 'xQc', apelidos: ['xqc'] },

  // Internacional: música, esporte, cinema e tecnologia
  { nome: 'Taylor Swift', apelidos: ['taylor swift'] },
  { nome: 'Billie Eilish', apelidos: ['billie eilish'] },
  { nome: 'Ariana Grande', apelidos: ['ariana grande'] },
  { nome: 'Selena Gomez', apelidos: ['selena gomez'] },
  { nome: 'Dua Lipa', apelidos: ['dua lipa'] },
  { nome: 'Rihanna', apelidos: ['rihanna'] },
  { nome: 'Drake', apelidos: ['drake'] },
  { nome: 'Kanye West', apelidos: ['kanye west', 'kanye'] },
  { nome: 'Kylie Jenner', apelidos: ['kylie jenner'] },
  { nome: 'Kim Kardashian', apelidos: ['kim kardashian'] },
  { nome: 'Cristiano Ronaldo', apelidos: ['cristiano ronaldo', 'cr7'] },
  { nome: 'Lionel Messi', apelidos: ['lionel messi', 'messi'] },
  { nome: 'Tom Holland', apelidos: ['tom holland'] },
  { nome: 'Zendaya', apelidos: ['zendaya'] },
  { nome: 'Mark Zuckerberg', apelidos: ['mark zuckerberg', 'zuckerberg'] },
  { nome: 'Jeff Bezos', apelidos: ['jeff bezos', 'bezos'] },
  { nome: 'Bill Gates', apelidos: ['bill gates'] }
];

// Primeiros nomes brasileiros extras (separados por espaço)
export const PRIMEIROS_NOMES_EXTRAS: string =
  'lucca luccas kaua pietro theo gael noah ravi henry bryan brian erick erik kevin wallace weslley ' +
  'washington yuri ian ryan rian nathan natan emanuel cauan ruan rubens sandro saulo severino silvio ' +
  'tarcisio telmo valter walter vagner wilson willian william adilson adailton airton ailton aldo ' +
  'alfredo amilton ademir agnaldo aluisio benedito cleiton clayton cleverson dalton deivid denilson ' +
  'diogo edgar edmilson edvaldo erivaldo everton ezequiel fagner felix fred frederico genilson gerson ' +
  'gilson givanildo glauber hamilton heber hudson humberto ismael ivan jackson jacson jailson jair ' +
  'jhonatan jonathan josue juliano kaique kauan kayke lazaro leo leonel lindomar lincoln lourival luan ' +
  'mailson marlon maxwell messias moises natanael nilton orlando pablo patrick paulino ramon raul ' +
  'reginaldo renan robson rodolfo romario ronan salomao sebastiao sidnei tadeu tales tobias ubiratan ' +
  'valmir vicente vilson wanderson welington yago yan zeca ' +
  'agatha alana alexia allana amelia andreia andressa antonella barbara benedita bia brenda cintia ' +
  'clarice cleonice conceicao dalila dalva diana edileuza eloisa elza emanuelly emilly emily eunice ' +
  'evelyn fatima francielle gabrielly giovanna hellen ilda iracema isadora isis ivanilda izabel jane ' +
  'janete jessyca joice josiane jucileide julieta kamila kamilly kauane keila kelen laila lara lavinia ' +
  'leda lurdes madalena maite marilia marisa marilene marlene marluce meire melissa mirela nadia ' +
  'natasha nicole nilza noemi odete ondina palmira pietra poliana rayane rayssa rejane rosimeire ' +
  'roseli rosemeire shirley stella suzana tamires tainara taina thalita thayna thamires vania vivian ' +
  'wanda yara zelia zenaide zuleide';

// Sobrenomes brasileiros extras (separados por espaço)
// Ficaram de fora palavras comuns do dia a dia (branco, leite, chaves, torres...).
export const SOBRENOMES_EXTRAS: string =
  'ferraz baptista bastos bento bittencourt braga brandao cabral caldas camargo cardozo carneiro ' +
  'cavalcanti coutinho damasceno delgado domingues dutra esteves falcao faria ' +
  'figueiredo furtado garcia godoi goncalves gouveia guedes henriques junior ' +
  'lins loureiro macedo magalhaes maia maciel marinho mascarenhas mattos medina menezes mesquita ' +
  'meireles mourao muniz novaes pimentel portela queiroz quintino rangel ' +
  'resende rezende salgado salles sales santanna saraiva seixas sobral tavora toledo ' +
  'trindade valadares vasconcelos vargas vasques veloso vidal viegas zanetti';