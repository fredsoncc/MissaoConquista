# MissaoConquista — Plano de produção

## Visão

MissaoConquista será uma releitura Web e Android do jogo de estratégia espacial por turnos associado ao Konquest/Gnu-Lactic, com identidade própria da FCcGames. A experiência inicial será uma partida jogável no navegador, com interface adaptável a toque e mouse, preparando o mesmo shell para empacotamento Android.

## Fatias de risco

| Fati a | Risco | Estratégia | Critério de verificação |
| --- | --- | --- | --- |
| Motor de turno | Estado inconsistente entre produção, movimento e conquista | Modelo puro em TypeScript, ações imutáveis e validação central | Testes cobrem produção, movimento, combate e vitória |
| Mapa galáctico | Leitura ruim em telas pequenas | SVG responsivo com zoom visual e seleção clara | Capturas desktop e 375px mostram planetas e rotas sem sobreposição |
| Multiplayer local | Alternância confusa | Fase de turno explícita e painel de jogador ativo | Dois jogadores conseguem alternar sem perder estado |
| Salas on-line | Persistência e sincronização | Schema de salas, membros, estado serializado e polling curto como fallback | Criar/listar/entrar/sair e atualizar lobby sem refresh |
| Presença em tempo real | Ausência de WebSocket no scaffold | Endpoint de estado com atualização automática e arquitetura substituível por WebSocket | Lobby reflete presença em ciclos curtos sem reload |
| Autenticação e admin | Acesso indevido a scores/dados | Procedimentos protegidos e checagem de role no servidor | Testes rejeitam usuário não autenticado e não-admin |
| Android | APK reproduzível | Capacitor sobre build Web e workflow de GitHub Actions | Workflow documentado gera artefato APK |

## Escopo inicial implementável

A primeira entrega deve ter abertura animada, menu, partida local completa, ranking público, lobby de salas com persistência, autenticação já integrada ao scaffold e telas administrativas protegidas. O multiplayer on-line terá estado básico persistido e atualização automática no lobby; a evolução posterior pode trocar o mecanismo de polling por WebSocket sem alterar o modelo de domínio.

## Critérios de aceite

A aplicação deve abrir no menu principal após a animação, permitir iniciar uma partida configurável, exibir mapa com planetas e rotas, produzir e mover naves, conquistar planetas e detectar vitória. O modo local deve alternar jogadores. A área de salas deve permitir criar, listar, entrar, sair e usar código. O ranking deve renderizar exatamente dez posições, preenchendo posições vazias com estados neutros, e a administração deve estar bloqueada para perfis sem role de administrador. O layout deve ser utilizável em desktop e viewport Android.
