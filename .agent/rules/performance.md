# Regras de Performance do Jogo
- Priorize baixa latência, bundle leve e animações fluidas (60fps em TVs).
- Evite adicionar novas dependências externas sem aprovação.
- Separe a lógica da tela da TV (Host) da tela dos jogadores (Controller).
- Otimize o tráfego de rede: envie apenas mudanças necessárias, nunca o estado inteiro sem necessidade.
- Sempre valide o build e verifique erros de console antes de concluir.
