import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

// Resposta do servidor em C++.
export interface SugestaoIa {
  area: string;
  confianca: number;
  probabilidades: Record<string, number>;
}

@Injectable({
  providedIn: 'root'
})
export class IaService {
  private http = inject(HttpClient);

  // Endereço do servidor da IA (o .\servidor precisa estar rodando).
  private readonly url = 'http://127.0.0.1:8080/classificar';

  // Envia a descrição e recebe a área sugerida.
  sugerirArea(texto: string): Observable<SugestaoIa> {
    const params = new HttpParams().set('texto', texto);
    return this.http.get<SugestaoIa>(this.url, { params });
  }
}