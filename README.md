# Felwritesit

## Funcionando:
  
  - Sistema de login
  - Sistema de criptografia dos textos e imagens.
  - Visualização suave das notas
  - Lixeira
  - Backup das anotações
  
### Sobre
Felwritesit é um diário diferente, possibilita armazenar imagens e estilizar o texto, a criptografia utilizada é AES-CBC-256 
Que utiliza a senha do usuário com SHA512(senha) para dificultar qualquer tentativa de descriptografia não autorizada das anotações,
todo o conteúdo é criptografado e salvo em um arquivo .db, e que posteriormente pode ser efetuado backup.

## TODO
 1. Corrigir bug da animação de carregamento travada na hora do backup 
 2. Efetuar um build do projeto e lançar uma release
