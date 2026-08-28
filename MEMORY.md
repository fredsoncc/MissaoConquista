# MissaoConquista — Memória de produção

A referência visual da FCC foi incorporada como composição split-screen: lado esquerdo institucional escuro com mensagem de produto e lado direito claro com o orbe planetário. O tabuleiro preserva o contraste escuro e usa pontos de luz pequenos e irregulares para simular um céu estrelado discreto, sem transformar o mapa em um fundo abstrato de alto ruído.

A entrega atual tem motor local jogável em TypeScript, mapa SVG responsivo, abertura animada, telas de salas/ranking e schema tRPC/Drizzle para evolução online. O scaffold de autenticação existente é Manus OAuth; o formulário visual de usuário/senha ainda precisa de uma implementação própria de contas locais antes de ser considerado concluído.

A sincronização foi desenhada com consulta periódica compatível com tRPC, evitando recarregamento da página. WebSocket/SSE pode ser adicionado depois mantendo os contratos de sala e estado.
