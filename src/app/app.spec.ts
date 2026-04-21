// Importa o TestBed do Angular
// Ele é usado para configurar o ambiente de testes
import { TestBed } from '@angular/core/testing';

// Importa o componente principal da aplicação
import { App } from './app';

// Bloco principal de testes do componente App
describe('App', () => {

  // beforeEach executa antes de cada teste
  // Aqui ele prepara o ambiente necessário
  beforeEach(async () => {

    // Configura o módulo de testes
    await TestBed.configureTestingModule({

      // Importa o componente que será testado
      imports: [App],

    }).compileComponents(); // Compila o componente e template
  });

  // Teste 1:
  // Verifica se o componente foi criado corretamente
  it('should create the app', () => {

    // Cria uma instância do componente
    const fixture = TestBed.createComponent(App);

    // Acessa a classe do componente
    const app = fixture.componentInstance;

    // Espera que o componente exista
    expect(app).toBeTruthy();
  });

  // Teste 2:
  // Verifica se o título foi renderizado no HTML
  it('should render title', async () => {

    // Cria o componente
    const fixture = TestBed.createComponent(App);

    // Aguarda carregamento completo
    await fixture.whenStable();

    // Captura o HTML renderizado
    const compiled = fixture.nativeElement as HTMLElement;

    // Procura a tag h1 e verifica o texto
    expect(
      compiled.querySelector('h1')?.textContent
    ).toContain('Hello, juridico-pro-app');
  });

});