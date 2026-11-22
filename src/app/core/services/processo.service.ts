// Importa o decorator Injectable e o inject do Angular
import { Injectable, inject } from '@angular/core';

// Importa o HttpClient, que faz as chamadas para a API
import { HttpClient } from '@angular/common/http';

// Importa recursos do RxJS
// BehaviorSubject guarda a lista atual e avisa os componentes quando ela muda
import { BehaviorSubject, Observable, map, tap } from 'rxjs';

// Importa o model Processo (tipagem dos dados)
import { Processo } from '../../models/processo.model';

// A API devolve a data como texto; aqui ela é convertida de volta para Date
type ProcessoApi = Omit<Processo, 'dataCriacao'> & { dataCriacao: string };

// Define que este service estará disponível globalmente no projeto
@Injectable({
  providedIn: 'root'
})
export class ProcessoService {

  // Faz as chamadas HTTP
  private http = inject(HttpClient);

  // Endereço da API (a pasta backend precisa estar rodando)
  private readonly url = 'http://127.0.0.1:3000/api/processos';

  // Lista atual de processos (começa vazia até a API responder)
  private subject = new BehaviorSubject<Processo[]>([]);

  // Retorna os dados em formato Observable
  // Componentes usam subscribe() para receber atualizações
  getAll() {
    return this.subject.asObservable();
  }

  // Busca a lista na API e atualiza a tela
  carregar(): Observable<Processo[]> {
    return this.http.get<ProcessoApi[]>(this.url).pipe(
      map(lista => lista.map(p => this.converter(p))),
      tap(lista => this.subject.next(lista))
    );
  }

  // Cria um processo na API
  // Omit significa: quem chama NÃO precisa enviar id, número e dataCriacao,
  // porque o servidor gera os três
  add(processo: Omit<Processo, 'id' | 'numero' | 'dataCriacao'>): Observable<Processo> {
    return this.http.post<ProcessoApi>(this.url, processo).pipe(
      map(p => this.converter(p)),
      // Coloca o novo processo no topo da lista
      tap(novo => this.subject.next([novo, ...this.subject.value]))
    );
  }

  // Atualiza um processo na API (o número não muda)
  update(processo: Processo): Observable<Processo> {
    return this.http.put<ProcessoApi>(`${this.url}/${processo.id}`, processo).pipe(
      map(p => this.converter(p)),
      // Troca o processo antigo pelo atualizado na lista
      tap(atualizado =>
        this.subject.next(
          this.subject.value.map(p => (p.id === atualizado.id ? atualizado : p))
        )
      )
    );
  }

  // Exclui um processo na API
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`).pipe(
      // Tira o processo da lista
      tap(() => this.subject.next(this.subject.value.filter(p => p.id !== id)))
    );
  }

  // Busca um processo na lista que já está carregada
  // Se não encontrar, retorna null
  getById(id: number) {
    return this.subject.value.find(p => p.id === id) ?? null;
  }

  // Converte a data (texto) que veio da API para Date
  private converter(p: ProcessoApi): Processo {
    return { ...p, dataCriacao: new Date(p.dataCriacao) };
  }
}