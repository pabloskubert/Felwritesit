import fs from 'fs';
import { ARQ_AUTENTICACAO_CAMINHO } from '../Configuracoes';

export default class {
    static jaRegistrado(): boolean {
        return  fs.existsSync(ARQ_AUTENTICACAO_CAMINHO);
    }
}
