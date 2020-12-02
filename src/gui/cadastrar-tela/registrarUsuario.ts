import hasha from 'hasha';
import fs from 'fs';
import { ROOT_DIR, ARQ_AUTENTICACAO_CAMINHO } from '../../Configuracoes';

export interface CadastroInfos {

   infoLogin: {
       nome: string;
       senha: string;
       validador(): boolean;
   },
   infosPessoal: {
       dicaSenha: string;
       email: string;
       validador(): boolean;
   },
   validarSenha(): boolean;
}

export interface Registro {
    nome: string;
    senha: string;
    email: string;
    dicaSenha: string;
}

export default class Cadastro {
   public registrarNovo(infos: Registro): string {
       const senhaHasheada = hasha(infos.senha, { algorithm: 'sha512' });
       const SALVAR_JSON = JSON.stringify({
           u: infos.nome,
           s: senhaHasheada,
           d: infos.dicaSenha,
           e: infos.email
       });

       if (!fs.existsSync(ROOT_DIR))
            fs.mkdirSync(ROOT_DIR);
       
       fs.writeFileSync(ARQ_AUTENTICACAO_CAMINHO, SALVAR_JSON);
       return senhaHasheada;
   }
}
