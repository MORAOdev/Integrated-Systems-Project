import { Component, signal } from '@angular/core';
import { Tarefa } from './tarefa';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  standalone: false,
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('TODOapp');
  arrayDeTarefas = signal<Tarefa[]>([]);
  apiURL: string;

  constructor(private http: HttpClient) {
    const isServer = typeof window === 'undefined';
    const boundUrl = typeof process !== 'undefined' && process.env ? process.env['API_URL'] : undefined;

    if (isServer) {
      // No servidor (SSR via Node), usa a URL interna do binding injetado pela Vercel
      this.apiURL = boundUrl ? boundUrl.replace(/\/$/, '') : 'http://localhost:3000';
    } else {
      // No navegador:
      // Se estiver em desenvolvimento local via `ng serve` (localhost:4200), direciona para porta 3000.
      // Na Vercel ou via `vercel dev`, utiliza '' para requisições relativas no mesmo domínio (/api/...).
      if (window.location.hostname === 'localhost' && window.location.port === '4200') {
        this.apiURL = 'http://localhost:3000';
      } else {
        this.apiURL = '';
      }
    }

    this.READ_tarefas();
  }

  CREATE_tarefa(descricaoNovaTarefa: string) {
    if (descricaoNovaTarefa.trim() === '') {
      return;
    }

    const novaTarefa = new Tarefa(descricaoNovaTarefa, false);

    this.http.post<Tarefa>(`${this.apiURL}/api/post`, novaTarefa).subscribe({
      next: (resultado) => {
        console.log(resultado);
        this.READ_tarefas();
      },
      error: (erro) => console.error('Erro ao criar tarefa:', erro)
    });
  }

  READ_tarefas() {
    this.http.get<Tarefa[]>(`${this.apiURL}/api/getAll`).subscribe({
      next: (resultado) => this.arrayDeTarefas.set(resultado),
      error: (erro) => console.error('Erro ao buscar tarefas:', erro)
    });
  }

  UPDATE_tarefa(tarefaAserModificada: Tarefa) {
    const indice = this.arrayDeTarefas().indexOf(tarefaAserModificada);
    const id = this.arrayDeTarefas()[indice]._id;

    this.http.patch<Tarefa>(`${this.apiURL}/api/update/${id}`, tarefaAserModificada).subscribe({
      next: (resultado) => {
        console.log(resultado);
        this.READ_tarefas();
      },
      error: (erro) => console.error('Erro ao atualizar tarefa:', erro)
    });
  }

  DELETE_tarefa(tarefaAserRemovida: Tarefa) {
    const indice = this.arrayDeTarefas().indexOf(tarefaAserRemovida);
    const id = this.arrayDeTarefas()[indice]._id;

    this.http.delete<Tarefa>(`${this.apiURL}/api/delete/${id}`).subscribe({
      next: (resultado) => {
        console.log(resultado);
        this.READ_tarefas();
      },
      error: (erro) => console.error('Erro ao remover tarefa:', erro)
    });
  }
}
