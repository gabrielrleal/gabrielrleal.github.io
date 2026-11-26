# Módulos de jogos

Cada pasta representa um jogo independente.

Requisitos mínimos:

- HTML próprio em `index.html`;
- nenhuma alteração necessária no launcher para abrir o jogo;
- entrada correspondente em `../../games.json`;
- recursos apenas locais ou carregados sob demanda;
- suporte a teclado, toque e controle remoto sempre que possível.

Ao usar `iframe`, o módulo deve retornar à central pelo botão global da interface, não mantendo estado pesado em memória após sair.
