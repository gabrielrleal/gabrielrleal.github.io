# Arcana — Central de jogos para TV

A página inicial funciona como um launcher leve. Cada jogo fica isolado em `games/<id>/` e só é carregado em um iframe quando o usuário o seleciona.

## Estrutura

- `index.html`, `launcher.css`, `launcher.js`: interface da central
- `games.json`: catálogo dos jogos exibidos
- `games/kukukaya/`: primeiro jogo integrado

## Adicionar um jogo

1. Crie uma pasta em `games/`, por exemplo `games/quiz/`.
2. Coloque o HTML, CSS e JavaScript do jogo nessa pasta.
3. Adicione uma entrada em `games.json`:

```json
{
  "id": "quiz",
  "title": "Quiz",
  "description": "Perguntas rápidas para a família.",
  "icon": "❓",
  "path": "./games/quiz/index.html",
  "enabled": true
}
```

Use `enabled: false` para manter um jogo cadastrado sem exibí-lo na TV.

## Executar localmente

```bash
python3 -m http.server 4173
```

Abra `http://localhost:4173/`.

## Recomendações para TV

- Não usar largura fixa; apoiar-se em `min()`, `clamp()` e grids responsivas.
- Manter elementos principais visíveis a pelo menos 1080p.
- Dar foco visível aos botões navegáveis por controle remoto.
- Evitar bibliotecas globais no launcher; carregar scripts externos dentro do módulo selecionado.
- Usar `Escape` ou o botão `Central` para descarregar o iframe.
