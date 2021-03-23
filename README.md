Projeto descontinuado, funcionando:

    1. Criar login - OK
    2. Sistema de login - OK
    3. Sistema para criptografar anotações - OK
    4. Sistema de backup - OK
    5. Lixeira - OK
    
Bugs
     - Quando o backup é efetuado, a animação de carregamento trava, pelo I/O ser uma task pesada.
     - O vetor de inialização usa 32 caracteres da senha hasheada, o que pode favorecer brute-forcing na senha.
     
     
Basta efetuar o build, as funções básicas de um diário estão implementadas, juntamente com a proteção com senha.
    
