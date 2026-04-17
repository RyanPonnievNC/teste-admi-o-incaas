import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';

import { ProcessoService } from '../../core/services/processo.service';
import { Processo } from '../../models/processo.model';

type StatusProcesso = 'ATIVO' | 'FINALIZADO' | 'SUSPENSO';

@Component({
  selector: 'app-processos',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TableModule,
    ButtonModule,
    TagModule
  ],
  templateUrl: './processos.component.html'
})
export class ProcessosComponent implements OnInit {
  private fb = inject(NonNullableFormBuilder);
  private service = inject(ProcessoService);

  processos: Processo[] = [];
  processosFiltrados: Processo[] = [];
  editandoId: number | null = null;

  filtroCliente = '';
  filtroStatus: '' | StatusProcesso = '';

  form = this.fb.group({
    numero: ['', Validators.required],
    cliente: ['', Validators.required],
    descricao: [''],
    status: ['ATIVO' as StatusProcesso, Validators.required]
  });

  ngOnInit() {
    this.service.getAll().subscribe(data => {
      this.processos = data;
      this.aplicarFiltros();
    });
  }

  salvar() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const valor = this.form.getRawValue();

    if (this.editandoId !== null) {
      const processoExistente = this.service.getById(this.editandoId);

      if (!processoExistente) return;

      this.service.update({
        ...processoExistente,
        numero: valor.numero,
        cliente: valor.cliente,
        descricao: valor.descricao,
        status: valor.status
      });

      this.cancelarEdicao();
      this.aplicarFiltros();
      return;
    }

    this.service.add({
      numero: valor.numero,
      cliente: valor.cliente,
      descricao: valor.descricao,
      status: valor.status
    });

    this.form.reset({
      numero: '',
      cliente: '',
      descricao: '',
      status: 'ATIVO'
    });

    this.aplicarFiltros();
  }

  editar(processo: Processo) {
    this.editandoId = processo.id;

    this.form.setValue({
      numero: processo.numero,
      cliente: processo.cliente,
      descricao: processo.descricao,
      status: processo.status
    });
  }

  cancelarEdicao() {
    this.editandoId = null;

    this.form.reset({
      numero: '',
      cliente: '',
      descricao: '',
      status: 'ATIVO'
    });
  }

  excluir(id: number) {
  const confirmou = window.confirm('Tem certeza que deseja excluir este processo?');

  if (!confirmou) return;

  if (this.editandoId === id) {
    this.cancelarEdicao();
  }

  this.service.delete(id);
  this.aplicarFiltros();
}

  aplicarFiltros() {
    this.processosFiltrados = this.processos.filter(processo => {
      const clienteOk =
        !this.filtroCliente ||
        processo.cliente.toLowerCase().includes(this.filtroCliente.toLowerCase());

      const statusOk =
        !this.filtroStatus || processo.status === this.filtroStatus;

      return clienteOk && statusOk;
    });
  }

  limparFiltros() {
    this.filtroCliente = '';
    this.filtroStatus = '';
    this.aplicarFiltros();
  }

  getStatusSeverity(status: StatusProcesso): 'success' | 'danger' | 'warn' {
    switch (status) {
      case 'ATIVO':
        return 'success';
      case 'FINALIZADO':
        return 'danger';
      case 'SUSPENSO':
        return 'warn';
    }
  }
}