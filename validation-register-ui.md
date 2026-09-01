# Validação do cadastro na interface pública

Data da validação: 2026-09-01.

A interface pública em `https://konquest.missao.duckdns.org/` carregou após o reinício do container. O diálogo **Entrar** abriu corretamente e o link **Criar conta** alternou para o formulário de cadastro. Com a conta de teste autorizada `qa_cadastro_20260901` e senha de teste contendo maiúsculas, números e símbolo, o medidor exibiu **Força da senha: Forte**. O envio exibiu o toast **Conta criada com sucesso** e retornou ao formulário de login com a mensagem **Perfil criado. Entre com sua nova conta.**. Em seguida, o login com as mesmas credenciais fechou o diálogo e retornou à tela inicial, confirmando o fluxo pela UI publicada.

Também foi confirmado via HTTP que, após reiniciar o processo remoto, `auth.register` respondeu com HTTP 200 para credenciais válidas e com erro de validação para senha curta; antes do restart, o bundle novo estava no filesystem, mas o processo antigo permanecia em memória e respondia `No procedure found on path "auth.register"`.
