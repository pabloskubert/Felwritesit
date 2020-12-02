import Database, { Database as DatabaseTYPE } from 'better-sqlite3';
import fs from 'fs';
import cripto from 'crypto';
import { remote } from 'electron';
import { DATABASE_ARQ, ARQ_AUTENTICACAO_CAMINHO, ROOT_DIR } from '../Configuracoes';

interface DIARIO_REGISTRO {
    titulo: string;
    texto: string;
    data: string[];
    sentimento: string;
    nota_id: number;
}

export default class Armazenamento {

    public static db_aberto: DatabaseTYPE;
    constructor() {
        if (!fs.existsSync(ROOT_DIR)) {
            fs.mkdirSync(ROOT_DIR);
        }
        Armazenamento.db_aberto = new Database(DATABASE_ARQ);

        remote.getCurrentWindow().once('close', () => {
            console.log('banco de dados fechado');
            this.fecharDB();
        });
    }


    public inicializarTabelas() {
        const regSheme = `(
            nota_id INTEGER PRIMARY KEY AUTOINCREMENT,           
            titulo TEXT NOT NULL,
            texto  TEXT NOT NULL,
            data TEXT NOT NULL,
            sentimento TEXT NOT NULL
        )`;

        Armazenamento.db_aberto.prepare('CREATE TABLE diario '.concat(regSheme)).run();
        Armazenamento.db_aberto.prepare('CREATE TABLE lixeira '.concat(regSheme)).run;

        // CRIA ID PARA INDENTIFICAR DB
        Armazenamento.db_aberto.prepare('CREATE TABLE bd_id (id INT)').run();
        Armazenamento.db_aberto.prepare('CREATE TABLE cripto (iv TEXT)').run();

        Armazenamento.db_aberto.prepare('INSERT INTO bd_id (id) VALUES (@ID_UNICO)')
            .run({ ID_UNICO: this.GEN_ID() });
        Armazenamento.db_aberto.prepare('INSERT INTO cripto (iv) VALUES (@iv)')
            .run({
                iv: cripto.randomBytes(16).toString('hex').slice(0, 16)
            });
    }

    public fecharDB() {
        Armazenamento.db_aberto.close();
    }

    private GEN_ID() {
        return Math.floor(Math.random() * Math.floor(9999999)).toString();
    }
}



const inserirRegistro = function inserirNovaAnotacao(reg_infos: DIARIO_REGISTRO) {
    const sql = Armazenamento.db_aberto.prepare(`
        INSERT INTO diario (titulo,texto,data,sentimento) VALUES
        (@titulo, @texto, @data, @sentimento)
    `);

    const inserir = Armazenamento.db_aberto.transaction((reg: DIARIO_REGISTRO) => {
        sql.run(reg);
    });

    try {
        inserir(reg_infos);
        return true;
    } catch (error) { return false };
}


const puxarRegistros = function pegarListaDeAnotacoes(): Array<DIARIO_REGISTRO> {
    const sql = `
        SELECT * FROM diario
    `
    return Armazenamento.db_aberto.prepare(sql).all().reverse();
}

const itensNaLixeira = function listarItensNaLixeira(): Array<DIARIO_REGISTRO> {
    const sql = `
        SELECT * FROM lixeira
    `;

    return Armazenamento.db_aberto.prepare(sql).all().reverse();
}

const moverParaLixeira = function excluirRegistroNoDiario(nota_id: number): void {
    const db = Armazenamento.db_aberto;
    const inserirNaLixeira = `
        INSERT INTO lixeira (titulo,texto, data, sentimento) VALUES
        (@titulo, @texto, @data, @sentimento)
    `;

    const excluirDoDiario = `
        DELETE FROM diario WHERE nota_id = @rmID
    `;

    const reg = db.prepare('SELECT titulo,texto, data, sentimento FROM diario WHERE nota_id = @rmID')
        .get({ rmID: nota_id });

    db.prepare(inserirNaLixeira).run(reg);
    db.prepare(excluirDoDiario).run({
        rmID: nota_id
    });
}

const restaurarNota = function resturarNotaDaLixeira(nota_id: number) {
    const db = Armazenamento.db_aberto;
    const sql = `
        SELECT titulo,texto,data,sentimento FROM lixeira WHERE nota_id = @nID
    `
    const inserirNoDiario = `
        INSERT INTO diario (titulo, texto, data, sentimento) VALUES (@titulo, @texto, @data, @sentimento)
    `;

    const notaNaLixeira = db.prepare(sql).get({ nID: nota_id });
    db.prepare('DELETE FROM lixeira WHERE nota_id = @restaurarID')
        .run({ restaurarID: nota_id });

    db.prepare(inserirNoDiario).run(notaNaLixeira);
}

const excluirDaLixeira = function excluirNotaPermanentemente(nota_id: number) {
    const db = Armazenamento.db_aberto;
    db.prepare('DELETE FROM lixeira WHERE nota_id = @rmID')
        .run({ rmID: nota_id });
}

const getIV = function pegarVetorDeInicializacao(): string {
    const row = Armazenamento.db_aberto.prepare('SELECT iv FROM cripto').get();
    return row.iv;
}

const getID = function getDatabaseID(): string {
    const row = Armazenamento.db_aberto.prepare('SELECT id FROM bd_id')
        .get();

    return row.id;
}

const bkpAutenticar = function salvarArqAutenticarNoDB() {

    try {
        Armazenamento.db_aberto.prepare('DROP TABLE autenticar_bkp').run();
    } catch (err) { }

    const stringJSON = fs.readFileSync(ARQ_AUTENTICACAO_CAMINHO).toString('utf8');

    Armazenamento.db_aberto.prepare('CREATE TABLE autenticar_bkp (dados TEXT)').run();
    Armazenamento.db_aberto.prepare(`INSERT INTO autenticar_bkp VALUES(@dados)`)
        .run({
            dados: stringJSON
        });
}

const restaurarAutenticar = function restaurarArquivoAutenticarDoBackup() {
    const a = new Armazenamento();
    const d = Armazenamento.db_aberto.prepare('SELECT dados FROM autenticar_bkp').get();
    fs.writeFileSync(ARQ_AUTENTICACAO_CAMINHO, d.dados);
}

const registroExiste = function verificarSeExisteNoDb(titulo: string) {
    const sql = 'SELECT titulo FROM diario WHERE titulo = @verificarTitulo';
    const linha = Armazenamento.db_aberto.prepare(sql).get({
        verificarTitulo: titulo
    });

    return linha.titulo !== undefined;
}

export {
    inserirRegistro, puxarRegistros, moverParaLixeira,
    registroExiste, bkpAutenticar, getIV,
    getID, restaurarAutenticar, itensNaLixeira,
    restaurarNota, excluirDaLixeira
};

