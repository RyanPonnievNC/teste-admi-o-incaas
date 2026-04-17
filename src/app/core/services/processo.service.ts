import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Processo } from '../../models/processo.model';

@Injectable({
  providedIn: 'root'
})
export class ProcessoService {
  private lista: Processo[] = [
    {
      id: 1,
      numero: '0001-2026',
      cliente: 'João Silva',
      descricao: 'Ação trabalhista',
      status: 'ATIVO',
      dataCriacao: new Date()
    },
    {
      id: 2,
      numero: '0002-2026',
      cliente: 'Maria Souza',
      descricao: 'Processo civil',
      status: 'FINALIZADO',
      dataCriacao: new Date()
    }
  ];

  private subject = new BehaviorSubject<Processo[]>(this.lista);

  getAll() {
    return this.subject.asObservable();
  }

  add(processo: Omit<Processo, 'id' | 'dataCriacao'>) {
    const novoProcesso: Processo = {
      ...processo,
      id: Date.now(),
      dataCriacao: new Date()
    };

    this.lista = [novoProcesso, ...this.lista];
    this.subject.next(this.lista);
  }

  update(processoAtualizado: Processo) {
    this.lista = this.lista.map(p =>
      p.id === processoAtualizado.id ? processoAtualizado : p
    );
    this.subject.next(this.lista);
  }

  delete(id: number) {
    this.lista = this.lista.filter(p => p.id !== id);
    this.subject.next(this.lista);
  }

  getById(id: number) {
    return this.lista.find(p => p.id === id) ?? null;
  }
}