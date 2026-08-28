# MissaoConquista — Estrutura

## Camadas

| Camada | Local | Responsabilidade |
| --- | --- | --- |
| Interface | `client/src/pages`, `client/src/components` | Menu, abertura, mapa, HUD, lobby, ranking e administração |
| Domínio | `client/src/game` | Regras puras de planetas, frotas, turnos, produção, combate e vitória |
| Persistência/API | `server/db.ts`, `server/routers.ts`, `drizzle/schema.ts` | Perfis, salas, membros, contatos, partidas e scores |
| Empacotamento | `android/`, `capacitor.config.ts`, `.github/workflows` | Build Web e geração de APK |

## Vocabulário de domínio

`Planet` representa um mundo com posição, dono, população, produção e vizinhos. `Fleet` representa naves enviadas entre planetas. `GameState` contém jogadores, planetas, frotas, turno, fase e vencedor. `Room` contém código, status, membros e snapshot do estado básico. `Score` registra o resultado de um jogador autenticado.

## Fluxo de tela

Abertura cósmica → Menu principal → escolha entre partida local, salas on-line e ranking → partida/lobby → resultado → salvamento de score.

## Estratégia de sincronização

A camada de sala expõe procedimentos tRPC para mutações e uma consulta de estado com refetch automático. A interface não recarrega a página; ela atualiza o cache e refaz a consulta em intervalo curto. O contrato de dados fica isolado para permitir a substituição futura por WebSocket/SSE sem reescrever o motor.

## Android

O build Web será a fonte de verdade visual. Capacitor empacotará os arquivos gerados em um projeto Android, preservando toque, viewport e navegação do jogo.
