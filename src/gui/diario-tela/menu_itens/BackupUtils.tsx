import React, { Component } from 'react';
import BackupUtils from '../../../node-utils/Backup';
import AbrirBackup from '../../../node-utils/FileBrowser';
import {
    View, Button,
    ProgressCircle
} from 'react-desktop';

interface Props {
    chaveMestra: string;
}

interface State {
    salvo_em: string;
    finalizado: boolean;
    acao: 'backup' | 'importar' | 'idle',
    progresso: string;
    qntImportados: number;
    erro: string;
}

export default class BackupItem extends Component<Props, State> {

    private readonly bkpUtil: BackupUtils;
    constructor(props: Props) {
        super(props);
        this.bkpUtil = new BackupUtils();
        this.state = {
            salvo_em: '',
            finalizado: false,
            acao: 'idle',
            erro: '',
            qntImportados: 0,
            progresso: 'Iniciando ',
        }
    }

    private readonly CONTAINER_ESTILO = {
        backgroundColor: '#dbdad5',
        margin: 'auto',
        marginTop: '13px',
        boxShadow: '2px',
        borderRadius: '5px',
        padding: '30px',
    }

    private readonly LIMITAR = {
        width: '500px'
    }

    private readonly BTN_ESTILO = {
        position: 'absolute',
        bottom: '6%',
        width: '400px'
    }

    acionar(acaoT: 'backup' | 'importar'): void {
        this.setState({
            acao: acaoT
        });

        if (acaoT === 'backup')
            this.bkpUtil.efetuarBackup(this.setState.bind(this));

        if (acaoT === 'importar') {
            const bkpArq = AbrirBackup.abrir();
            if (bkpArq !== undefined) {
                this.bkpUtil.importarBackup(bkpArq[0], true, this.setState.bind(this));
            } else this.setState({ acao: 'idle' });
        }
    }

    renderizarContainer(elementos_filhos: Array<JSX.Element> | JSX.Element): JSX.Element {
        return (
            <div style={this.LIMITAR}>
                <View width="80%" height="300px" style={this.CONTAINER_ESTILO}
                    layout='vertical'
                    horizontalAlignment='center'
                >
                    {elementos_filhos}
                </View>
            </div>
        );
    }

    render(): JSX.Element {
        const PAINEL_PRINCIPAL = this.renderizarContainer(
            [<Button
                width={150}
                height={75}
                color="#6ce04c"
                padding="15px"
                push
                key={0}
                onClick={() => this.acionar('importar')}
            ><strong>IMPORTAR BACKUP</strong>
                <p>As suas novas anotações não serão perdidas quando o backup for importado, elas se juntarão as existentes.</p>
            </Button>,
            <Button
                height={75}
                color="#546d78"
                padding="15px"
                push
                style={this.BTN_ESTILO}
                key={1}
                onClick={() => this.acionar('backup')}
            ><strong>EFETUAR BACKUP</strong>
                <p>O backup irá salvar seu login bem como suas anotações, lembre-se de fazer backups constantes e <strong>atualizados</strong></p>
            </Button>
            ]);

        const titulo =
            <h3 style={{ color: '#31d65d' }}>{
                this.state.progresso.concat((this.state.acao === 'backup') ? ' backup ' : ' importação ')
                    .concat(', aguarde.')
            }</h3>;

        const tarefa_executando =
            <>
                <div style={{ marginTop: '80px' }}></div>
                <ProgressCircle size={100} />
                {titulo}
            </>;

        if (this.state.finalizado) {
            if (this.state.erro === '') {
                const add = (this.state.acao === 'importar')
                    ? <p key={3} style={{ color: 'green' }}>Foram importadas {this.state.qntImportados} notas do backup.</p>
                    : <p key={3}></p>;

                return (
                    this.renderizarContainer([
                        <h2 key={0} style={{
                            color: "#28fc03",
                            marginTop: '50px'
                        }}>{`${(this.state.acao === 'backup') ? 'Backup' : 'Importação'}`} concluído com êxito</h2>,
                        <p key={1}><strong>{`${this.state.acao === 'backup' ? 'Arquivo de backup salvo na Àrea de Trabalho com o nome ' : ''}`}
                            <span style={{ color: '#62bce3' }}>{this.state.salvo_em}</span></strong></p>,
                        add
                    ])
                );
            } else {
                // somente a ação de importar retorna um erro
                return (
                    this.renderizarContainer(
                        <h2>{this.state.erro}</h2>
                    )
                );
            }
        }
        const PAINEL_TAREFA = this.renderizarContainer(tarefa_executando);
        return (this.state.acao !== 'idle') ? PAINEL_TAREFA : PAINEL_PRINCIPAL;
    }
}

