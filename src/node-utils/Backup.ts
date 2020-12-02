import { createGzip, createUnzip } from 'zlib';
import { pipeline } from 'stream';
import os from 'os';
import path from 'path';
import fs, {
    createReadStream,
    createWriteStream,
} from 'fs';
import {
    ARQ_AUTENTICACAO_CAMINHO,
    DATABASE_ARQ,
    ROOT_DIR
} from '../Configuracoes';
import { SetStateAction } from 'react';
import { bkpAutenticar, restaurarAutenticar } from '../database/index';
import { inserirRegistro, registroExiste, getID } from '../database/index';
import Database from 'better-sqlite3';

export default class BackupUtils {

    /*  TO-DO: 

        Todas as funções que usam o better-sqlite são síncronas portanto
        estão bloqueando a animação de carregamento da tela, dando à impressão 
        de que o aplicativo travou.
    
        Fixar usando funções assíncronas.
    */
    // @ts-ignore
    public efetuarBackup(atualizarProgresso: SetStateAction) {
        bkpAutenticar();

        const bkpCaminho = path.join(os.homedir(), 'Desktop', 'FELWRITESIT_BKP_' + this.randInt() + '.gzip');
        const gzip = createGzip();
        const origem = createReadStream(DATABASE_ARQ);
        const destino = createWriteStream(bkpCaminho);

        atualizarProgresso({ acao: 'backup', progresso: 'Compactando banco de dados (gzip)...' });
        pipeline(origem, gzip, destino, (err) => {
            if (err) {
                console.error('Erro ao compactar arquivo:', err);
            }

            origem.close();
            destino.close();
        });

        atualizarProgresso({
            finalizado: true,
            acao: 'backup',
            salvo_em: path.basename(bkpCaminho)
        });
    }

    // @ts-ignore
    public importarBackup(caminhoBkp: string, autenticado: boolean, atualizarProgresso: SetStateAction) {
        const tmpDir = path.join(
            os.tmpdir() + path.sep + this.randInt()
        );
        fs.mkdirSync(tmpDir);

        const extrairPara = path.join(tmpDir, 'diario_secreto.db3');
        const extrair = createUnzip();
        const origem = createReadStream(caminhoBkp);
        const destino = createWriteStream(extrairPara);

        pipeline(origem, extrair, destino, (err) => {

            if (err) {
                console.error('Erro ao extrair arquivo.')
            }
            origem.close();
            destino.close();
            
            /* usuário está efetuando backup pela tela de cadastro */
            if (!autenticado) {
                if (!fs.existsSync(ROOT_DIR))
                    fs.mkdirSync(ROOT_DIR);
    
                fs.copyFileSync(extrairPara, DATABASE_ARQ);
                restaurarAutenticar();
                atualizarProgresso({ finalizado: true });
            } else {
                this.mesclarDados(extrairPara, atualizarProgresso);
            }
        });

    }

    /* funções internas */
    // @ts-ignore
    private mesclarDados(bkp_caminho: string, atualizar: SetStateAction) {
        const db_bkp = new Database(bkp_caminho);
        let qntAdicionados = 0;

        // verifica o ID do banco de dados, para verificar se BD do backup e do usuário são iguais
        const row = db_bkp.prepare('SELECT id FROM bd_id').get();

        if (row.id !== getID()) {
            atualizar({
                finalizado: true,
                erro: 'O backup selecionado pertence a outro login e possuí uma chave criptográfica diferente, portanto é impossível importa-lo.'
            });
            db_bkp.close();
            return;
        }

        atualizar({ acao: 'importar', progresso: 'Lendo o arquivo de backup...' });
        const linhasBKP = db_bkp.prepare(`SELECT * FROM diario`).all();

        atualizar({ acao: 'importar', progresso: 'Lendo todas as anotações e atualizando...' });
        for (let linha of linhasBKP) {

            const existe = registroExiste(linha.titulo);
            if (!existe) {
                inserirRegistro(linha);
                qntAdicionados++;
            }
        }

        atualizar({ finalizado: true, qntImportados: qntAdicionados });
    }

    private randInt(): number {
        return Math.floor(Math.random() * Math.floor(9999));
    }
};
