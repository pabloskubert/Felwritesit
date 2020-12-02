import path  from 'path';
import os from 'os';

const
    ROOT_DIR = path.join(os.homedir(), '.felwritesitData'),
    ARQ_AUTENTICACAO_CAMINHO = path.join(ROOT_DIR, 'autenticar'),
    DATABASE_ARQ = path.join(ROOT_DIR, 'diario_secreto.db3');


export { ROOT_DIR, ARQ_AUTENTICACAO_CAMINHO, DATABASE_ARQ };
