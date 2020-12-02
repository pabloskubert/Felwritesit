import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import {
    ListView,
    ListViewHeader,
    ListViewSection,
    ListViewRow,
    Text,
    Button
} from 'react-desktop';
import Cripto from '../../../node-utils/Criptografia';
import {
    puxarRegistros, moverParaLixeira,
    itensNaLixeira, restaurarNota,
    excluirDaLixeira
} from '../../../database/index';
import Assets from './Assets';

interface Props {
    chaveMestra: string;
    lixeira?: boolean;
}

interface State {
    visualizarNota: boolean;
}

interface MenuEntrada {
    titulo: string;
    texto: string;
    data: string[];
    sentimento: string;
    nota_id: number;
}

export default class ListarTodasAsNotas extends Component<Props, State> {

    private readonly db;
    private readonly criptoUtil: Cripto;
    private LINHA_ID = 999;
    private listaMapeada: Map<number, MenuEntrada>;

    constructor(props: Props) {
        super(props);
        this.state = {
            visualizarNota: false
        }

        this.criptoUtil = new Cripto();

        /* eslint-disable */
        // @ts-ignore
        const btnAcao = (op: string, atualizar: Function) => {
            return () => {
                const limite = this.listaMapeada.size - 1;
                const proximo = this.LINHA_ID + 1;

                // Estabelece os limites dos botões de navegação
                this.LINHA_ID = (op === 'voltar')
                    ? (this.LINHA_ID > 0) ? this.LINHA_ID - 1 : this.LINHA_ID
                    : (proximo <= limite) ? this.LINHA_ID + 1 : this.LINHA_ID;

                atualizar({ visualizarNota: true });
            }
        }

        // @ts-ignore
        window.btnProx = btnAcao('proximo', this.setState.bind(this));

        // @ts-ignore
        window.btnAnterior = btnAcao('voltar', this.setState.bind(this));

        // @ts-ignore
        window.btnExcluir = () => {
            const notaID = this.listaMapeada.get(
                this.LINHA_ID
            ).nota_id;

            moverParaLixeira(notaID);
            const proxima = this.LINHA_ID + 1;
            const limite = this.listaMapeada.size - 1;

            // verifica se tem uma nota anterior ou próxima para mostrar depois que excluir a atual
            this.LINHA_ID = (this.listaMapeada.has(this.LINHA_ID + 1))
                ? this.LINHA_ID + 1 :
                this.listaMapeada.has(this.LINHA_ID - 1)
                    ? this.LINHA_ID - 1
                    : this.LINHA_ID;
            this.setState({ visualizarNota: true });
        }
    }

    selecionarNota(ID: number): void {
        const linhaDisparada = document.querySelector(`.linha${ID}`) as HTMLDivElement;

        /* limpa o background da linha anterior */
        const anterior = document.querySelector(`.linha${this.LINHA_ID}`) as HTMLDivElement;
        if (anterior !== null) anterior.style['backgroundColor'] = 'white';
        linhaDisparada.style['backgroundColor'] = '#ccd6c7';

        this.LINHA_ID = ID;
        this.setState({ visualizarNota: false });
    }

    renderizarNota(btnVoltar: unknown): JSX.Element {
        const verNota = this.listaMapeada.get(this.LINHA_ID);
        let adicionarHTML

        if (verNota !== undefined) {
            adicionarHTML = `
            <style>
                img {
                    width: 100%;
                    height: 80%;
                }

                div#painel_nota {
                    position: absolute;
                    overflow-y: scroll;
                }

                div#gravado_em {
                    font-size: 11px;
                    position: absolute;
                    right: 4%;
                    top: 3%;
                }

                div#controles {
                    position: absolute;
                    left: 3.5%;
                    top: 3%;
                    width: 180px;
                    height: 30px;
                }

            </style>
            <div id='gravado_em'>
                Salvo em ${verNota.data[0]} às ${verNota.data[1]}
            </div>

            <div id='controles'>
                <button type='button' onclick='window.btnAnterior()'>
                    ${Assets.iconeNotaAnterior()}
                </button>

                <button type='button' onclick='window.btnProx()' style='margin-left: 9px'>
                    ${Assets.iconeProximaNota()}
                </button>

                <button type='button' onclick='window.btnExcluir()' style='margin-left: 30px'>
                     ${Assets.iconeExcluirNota()}
                </button>
            </div>
            <br>
            `;
        } else {

            // caso não haja nenhum anotação, mostra uma imagem como background
            adicionarHTML = `
                <style>
                    div#bg_vazio {
                        background-image: url("data:image/jpg;base64,${Assets.nenhumaNotaBackground()}");
                        background-repeat: no-repeat;
                        background-size: cover;
                        filter: blur(8px);
                        position: relative;
                        width: 480px;
                        height: 350px;
                    }

                    h2 { 
                        text-align: center;
                        color: white;
                        box-shadow: 4px 4px 4px;
                        font-family: 'Segoe UI';
                        margin-top: '80px';
                    }
                </style>
                 <h3>Você não tem nenhum anotação, <i>anote</i> algo e poderá ver por aqui.<h3>
            `
        }


        const html = { __html: adicionarHTML.concat((verNota !== undefined) ? verNota.texto : '') };
        return (
            <>
                {btnVoltar}
                <div dangerouslySetInnerHTML={html} id="painel_nota" style={{
                    width: '480px',
                    margin: '0 15px 0 0',
                    height: '350px',
                    backgroundColor: 'white',
                    padding: '15px',
                    borderRadius: '10px'
                }}
                ></div>
            </>
        );
    }

    excluirNotaPermanentemente() {
        if (this.listaMapeada.size === 0) return;

        const rmID = this.listaMapeada.get(this.LINHA_ID).nota_id;
        excluirDaLixeira(rmID);
        this.setState({ visualizarNota: false });
    }

    resturarNotaDaLixeira() {
        if (this.listaMapeada.size === 0) return;

        const restID = this.listaMapeada.get(this.LINHA_ID).nota_id;
        restaurarNota(restID);
        this.setState({ visualizarNota: false });
    }

    render(): JSX.Element {
        /*
            O valor padrão do LINHA_ID é 999, quando a lista está vazia 
            o valor permanece o mesmo, só muda quando um item na lista é selecionado.
            Portanto se LINHA_ID !== 999 a lista não está vazia.
        */
        let btnAcao = (this.LINHA_ID !== 999)
            ? () => this.setState({ visualizarNota: true })
            : () => void 0;

        const btnEsquerdo = ReactDOM.createPortal(
            <Button
                theme='dark'
                push
                color="#8dc955"
                style={{
                    padding: '5px 50px',
                    borderRadius: '15px'
                }}
                onClick={(this.props.lixeira) ? this.excluirNotaPermanentemente.bind(this) : btnAcao}
            >{(this.props.lixeira)
                ? 'Excluir nota'
                : (this.state.visualizarNota) ? "Voltar" : "Visualizar"}
            </Button>, document.getElementById('btnLateral_esquerdo'));

        const btnResturarNota = ReactDOM.createPortal(
            <Button
                theme='dark'
                push
                color="#8dc955"
                style={{
                    padding: '5px 43px',
                    borderRadius: '15px'
                }}
                onClick={this.resturarNotaDaLixeira.bind(this)}
            >Resturar nota</Button>
            , document.getElementById('btnLateral_excluirNota'));

        const PAINEL_NOTAS = (
            <>
                { this.props.lixeira &&
                    btnResturarNota
                }
                {btnEsquerdo}
                <ListView background="#f1f2f4" width="500" height="200">
                    <ListViewHeader>
                        <Text size="11" color="#696969">{
                            (this.props.lixeira) ?
                                'Caso você exclua da lixeira, a nota será excluída e não poderá ser recuperada.'
                                : 'Titulo ~ Sentimento'
                        }</Text>
                    </ListViewHeader>

                    <ListViewSection>
                        {this.renderizarPagina()}
                    </ListViewSection>
                </ListView>
            </>
        );

        return (!this.state.visualizarNota) ? PAINEL_NOTAS : this.renderizarNota(btnEsquerdo);
    }

    decriptar(texto: string): string {
        return this.criptoUtil.decriptar(this.props.chaveMestra, texto);
    }

    renderizarPagina(): Array<JSX.Element> {
        this.listaMapeada = new Map<number, MenuEntrada>();
        const arr = new Array<JSX.Element>();
        const notas = (this.props.lixeira)
            ? itensNaLixeira()
            : puxarRegistros();

        notas.forEach((anotacao, index) => {
            const metadata = {
                titulo: this.decriptar(anotacao.titulo),
                sentimento: this.decriptar(anotacao.sentimento),
                // @ts-ignore
                data: this.decriptar(anotacao.data).split(',')
            }

            arr.push(this.renderizarLinha(index, metadata));
            this.listaMapeada.set(index, {
                ...metadata,
                texto: this.decriptar(anotacao.texto),
                nota_id: anotacao.nota_id
            });
        });
        return arr;
    }

    renderizarLinha(ID: number, METADATA: { titulo: string; sentimento: string; data: string[]; }): JSX.Element {
        return (
            <ListViewRow
                onClick={() => this.selecionarNota(ID)}
                key={ID}
                className={`linha${ID}`}
                style={{ overflow: 'hidden', backgroundColor: 'white' }}
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    x="0"
                    y="0"
                    enableBackground="new 0 0 512.178 512.178"
                    version="1.1"
                    viewBox="0 0 512.178 512.178"
                    xmlSpace="preserve"
                    width="25px"
                    height="25px"
                >
                    <path
                        fill="#FFA000"
                        d="M396.784 446.596L266.011 115.929a10.667 10.667 0 00-8.661-6.656L54.683 85.422c-5.752-.808-11.07 3.2-11.878 8.952-.018.13-.034.261-.048.392L.091 436.1c-.763 5.841 3.353 11.196 9.194 11.959.085.011.171.021.256.03l373.333 42.667h1.216a10.667 10.667 0 0010.667-9.664l2.773-29.589a10.635 10.635 0 00-.746-4.907z"
                    ></path>
                    <path
                        fill="#FFE082"
                        d="M469.424 94.766c-.684-5.851-5.983-10.04-11.834-9.355l-.092.011-91.733 10.795-270.933 31.872c-5.801.659-9.994 5.86-9.408 11.669l32 341.333a10.667 10.667 0 0010.667 9.664h1.216l373.333-42.667c5.853-.671 10.053-5.96 9.382-11.813a6.114 6.114 0 00-.016-.134L469.424 94.766z"
                    ></path>
                    <path
                        fill="#455A64"
                        d="M309.424 170.756a10.667 10.667 0 01-7.552-18.219l53.333-53.333c4.093-4.237 10.845-4.355 15.083-.262 4.237 4.093 4.354 10.845.262 15.083-.086.089-.173.176-.262.262l-53.333 53.333a10.672 10.672 0 01-7.531 3.136z"
                    ></path>
                    <circle cx="394.758" cy="74.756" r="53.333" fill="#F44336"></circle>
                    <path d="M384.091 490.756h-1.216l-128-14.635c-5.853-.668-10.056-5.955-9.388-11.808l.001-.011c.734-5.821 5.983-9.989 11.819-9.387l117.184 13.397 1.749-18.752a10.9 10.9 0 0111.627-9.621c5.865.551 10.173 5.752 9.622 11.618l-.001.009-2.773 29.589a10.668 10.668 0 01-10.624 9.601zM125.339 461.166h-1.237L9.542 448.089c-5.858-.622-10.103-5.875-9.481-11.733.009-.086.019-.171.03-.256L42.758 94.766c.578-5.768 5.723-9.975 11.491-9.397.145.015.29.032.435.053l202.667 23.851c5.811.967 9.739 6.461 8.772 12.272a10.666 10.666 0 01-11.268 8.89L62.704 107.929 22.683 428.057l103.851 11.861c5.891.33 10.399 5.373 10.069 11.264-.33 5.891-5.373 10.399-11.264 10.069v-.085zM309.424 170.756a10.667 10.667 0 01-7.552-18.219l53.333-53.333c4.093-4.237 10.845-4.355 15.083-.262 4.237 4.093 4.354 10.845.262 15.083-.086.089-.173.176-.262.262l-53.333 53.333a10.672 10.672 0 01-7.531 3.136z"></path>
                    <path d="M128.091 490.756a10.667 10.667 0 01-10.667-9.664l-32-341.333c-.586-5.809 3.607-11.01 9.408-11.669l270.933-31.872c5.811-.967 11.306 2.961 12.272 8.772.967 5.811-2.961 11.306-8.772 12.272-.333.055-.668.095-1.004.118l-260.587 30.741 30.016 320.128 351.808-40.213-40.021-320.107-18.88 2.133c-5.811.967-11.306-2.961-12.272-8.772-.967-5.811 2.961-11.306 8.772-12.272.333-.055.668-.095 1.004-.118l29.397-3.477c5.845-.735 11.179 3.407 11.914 9.252l.011.092L512.091 436.1c.745 5.844-3.388 11.185-9.232 11.93a6.114 6.114 0 01-.134.016l-373.333 42.667-1.301.043z"></path>
                    <path d="M394.758 128.089c-29.455 0-53.333-23.878-53.333-53.333s23.878-53.333 53.333-53.333 53.333 23.878 53.333 53.333-23.878 53.333-53.333 53.333zm0-85.333c-17.673 0-32 14.327-32 32s14.327 32 32 32 32-14.327 32-32-14.327-32-32-32z"></path>
                </svg>
                <Text bold="500"
                    marginLeft="13px"
                >{METADATA.titulo} -</Text>
                <Text
                    marginLeft='5px'
                >{METADATA.sentimento}</Text>
                <Text style={{ borderBottom: '1.5px solid gray' }}></Text>
            </ListViewRow>
        );
    }
}

