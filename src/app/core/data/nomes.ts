// Listas usadas para reconhecer nomes de pessoas na descrição do processo.
// Para ensinar um nome novo à IA, basta acrescentar na lista certa (sem acentos e em minúsculas).

export type TipoPessoa = 'comum' | 'publica';

// Pessoas conhecidas. "apelidos" são as formas pelas quais a pessoa pode ser escrita.
// A busca perdoa pequenos erros de digitação (ex.: "elon musck", "junstin bieber").
export interface PessoaPublica {
  nome: string;
  apelidos: string[];
}

export const PESSOAS_PUBLICAS: PessoaPublica[] = [
  { nome: 'Elon Musk', apelidos: ['elon musk', 'elon'] },
  { nome: 'Seu Jorge', apelidos: ['seu jorge'] },
  { nome: 'Justin Bieber', apelidos: ['justin bieber', 'bieber'] },
  { nome: 'Kleberiano', apelidos: ['kleberiano'] }
];

// Primeiros nomes comuns no Brasil.
export const PRIMEIROS_NOMES = new Set(
  (
    'joao jose antonio francisco carlos paulo pedro lucas luiz luis marcos gabriel rafael daniel ' +
    'marcelo bruno eduardo felipe raimundo rodrigo manoel manuel mateus matheus andre fernando fabio ' +
    'leonardo gustavo guilherme leandro tiago thiago anderson ricardo marcio jorge sergio alexandre ' +
    'roberto edson diego vitor victor vinicius claudio renato henrique julio cesar igor otavio caio ' +
    'samuel davi david miguel arthur artur heitor bernardo enzo nicolas lorenzo joaquim benjamin joel ' +
    'elias isaac jonas adriano alan alex alberto alisson wellington wagner valdir wesley ronaldo ' +
    'reinaldo rogerio osvaldo nelson murilo mauricio mario luciano lucio kleber jefferson jeferson ' +
    'hugo helio gilberto geraldo flavio fabricio evandro emerson elton edilson douglas denis danilo ' +
    'cristiano cleber cicero breno augusto arnaldo amaro abel ' +
    'maria ana francisca antonia adriana juliana marcia fernanda patricia aline sandra camila amanda ' +
    'bruna jessica leticia julia luciana vanessa mariana gabriela vera vitoria larissa claudia ' +
    'beatriz renata daniela carla simone cristina raimunda rita sonia sueli tereza teresa terezinha ' +
    'lucia luzia regina rosa rosangela rosana silvia solange tatiana tania viviane valeria veronica ' +
    'debora denise elaine eliane elisa eliana fabiana flavia gisele giovana helena heloisa ingrid ' +
    'isabela isabel isabella ivone jaqueline joana josefa karina kelly laura lais livia lorena luana ' +
    'luiza manuela marcela margarida marina marli marta michele mirian miriam monica natalia nathalia ' +
    'neusa paula paola priscila rafaela raquel rebeca roberta sabrina samira sara sheila sofia ' +
    'stefany suelen talita thais valentina yasmin alice alessandra angela aparecida bianca carolina ' +
    'catarina celia clara cleide dayane edna eduarda elizabete erica esther estela eva geovana ' +
    'glaucia graziela iara irene ivana janaina katia leila lidia lilian luma maiara malu mayara ' +
    'milena nair nayara olivia pamela rute selma silvana vilma zilda'
  ).split(' ')
);

// Sobrenomes comuns. Servem para completar o nome (ex.: "João Silva").
export const SOBRENOMES = new Set(
  (
    'silva souza sousa santos oliveira pereira lima costa ferreira rodrigues almeida nascimento alves ' +
    'carvalho gomes martins araujo ribeiro barbosa rocha dias monteiro mendes cardoso reis castro ' +
    'andrade freitas teixeira moreira correia machado barros nunes vieira fernandes cavalcante cunha ' +
    'pinto moura campos melo azevedo borges ramos lopes duarte pires miranda medeiros farias batista ' +
    'tavares siqueira albuquerque xavier assis coelho bezerra paiva guimaraes fonseca prado bernardes ' +
    'lacerda peixoto brito viana aguiar lemos matos nogueira franco motta santana sampaio cordeiro ' +
    'morais soares marques lourenco tomaz'
  ).split(' ')
);

// Nomes que também são palavras do dia a dia ("rosa", "vitória", "paz").
// Só são tratados como nome de pessoa quando escritos com letra maiúscula.
export const NOMES_AMBIGUOS = new Set(['rosa', 'vitoria', 'gloria', 'esperanca', 'paz', 'luz', 'cesar', 'sara']);
