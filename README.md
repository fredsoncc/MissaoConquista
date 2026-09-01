# MissaoConquista

**MissaoConquista** é um jogo de estratégia espacial por turnos da FCCGames, inspirado no Konquest do KDE/Gnu-Lactic e redesenhado para a Web e Android. A proposta combina a nostalgia dos clássicos de estratégia de computador com uma apresentação cósmica contemporânea e uma experiência de salas multiplayer.

## Visão do jogo

Comande uma aliança, produza naves, envie frotas pelas rotas galácticas e conquiste planetas antes dos rivais. Cada turno exige leitura do mapa, cálculo de produção e decisão de risco. A primeira versão jogável inclui campanha local no mesmo dispositivo, alternância de comandantes, mapa responsivo, abertura animada, salas e ranking.

## Tecnologias

| Área | Tecnologia |
| --- | --- |
| Interface | React 19, Vite, Tailwind CSS 4, shadcn/ui |
| Motor visual | SVG responsivo e Babylon.js preparado para cenas 3D |
| Backend | Express, tRPC 11, Drizzle ORM, MySQL/TiDB |
| Identidade | Manus OAuth no scaffold e estrutura de perfis protegidos |
| Android | Capacitor, projeto Android gerado no CI |
| Automação | GitHub Actions com artefato `missao-conquista-apk` |

## Execução local

```bash
pnpm install
pnpm dev
```

Acesse o endereço de desenvolvimento exibido pelo servidor. Para validar o código e os testes:

```bash
pnpm check
pnpm test
```

## Banco de dados

O schema contém tabelas para salas, membros, contatos e scores. Em um ambiente com banco configurado, gere e aplique migrações com o fluxo Drizzle do projeto. As operações de sala e ranking são expostas por procedimentos tRPC, com mutações protegidas para usuários autenticados.

## Android

O projeto usa Capacitor como ponte entre o bundle Web e o Android. Em um ambiente local com Android SDK, execute `pnpm build`, depois `npx cap add android`, `npx cap sync android` e `npx cap open android`. O workflow `.github/workflows/android-apk.yml` executa esse processo no GitHub Actions e disponibiliza o APK debug como artefato a cada push em `main` ou `master`.

## Publicação Web

A publicação Web deve ser feita pelo botão **Publish** no painel de gerenciamento do projeto após um checkpoint estável. O hosting gerenciado entrega o jogo em um domínio Manus com suporte a domínio personalizado.

### Atualização do servidor Docker remoto

Para uma instalação Docker própria, use o script versionado `scripts/update-remote.sh` depois de gerar a build. Ele copia `dist`, reinicia obrigatoriamente o container e só termina quando o processo está em execução, evitando que o frontend novo converse com um router tRPC antigo em memória:

```bash
pnpm build
REMOTE_SSH_KEY=/caminho/da/chave \\
REMOTE_HOST=132.145.196.158 \\
REMOTE_CONTAINER=fcc-missao-konquest \\
./scripts/update-remote.sh
```

O script não grava chaves nem senhas no repositório. `REMOTE_USER` pode ser definido quando o usuário remoto não for `ubuntu`.

## Referências

A base conceitual e as regras nostálgicas vêm do projeto [KDE/konquest](https://github.com/kde/konquest), cujo README descreve Konquest como um jogo de estratégia multiplayer cujo objetivo é expandir um império interestelar e derrotar rivais. O repositório `fredsoncc/MissaoConquista` estava vazio no momento da inicialização; por isso, ele foi usado como destino do novo código FCCGames, enquanto o repositório do KDE foi tratado como referência de mecânicas e licença.

## Primeiro acesso administrativo

Para reduzir o trabalho de implantação, a instalação cria automaticamente uma conta administrativa temporária com usuário `admin` e senha `admin` quando ainda não existe uma conta local. No primeiro login, o painel permanece bloqueado e solicita uma nova senha com pelo menos 12 caracteres. Depois da troca, a senha temporária deixa de funcionar e a nova senha é armazenada somente como hash. Em produção, altere a senha imediatamente após o primeiro acesso e não reutilize `admin` em ambientes expostos publicamente.
