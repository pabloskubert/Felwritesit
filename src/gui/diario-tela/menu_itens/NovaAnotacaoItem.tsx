import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { Editor } from '@bit/primefaces.primereact.editor';
import PrimereactStyle from '@bit/primefaces.primereact.internal.stylelinks';
import { inserirRegistro } from '../../../database/index';
import { getBCLS } from '../../DomUtils';
import Cripto from '../../../node-utils/Criptografia';
import { isDefined, it } from '../../../node-utils/varUtils';

import {
    Button, Text,
    TextInput, View,
    Box
} from 'react-desktop';

interface State {
    text: string;
    titulo: string;
    salvar: boolean;
    finalizado: boolean;
}

interface Props {
    chaveMestra: string;
}

export default class NovaAnotacao extends Component<Props, State> {

    private readonly criptoUtils: Cripto;
    private readonly BTN_ESTILO = {
        padding: '5px 50px',
        borderRadius: '15px'
    }

    constructor(props: Props) {
        super(props);
        this.state = {
            text: '',
            titulo: '',
            salvar: false,
            finalizado: false
        }
        this.criptoUtils = new Cripto();
    }

    renderizarInput(label: string, cor: string, classN: string): JSX.Element {
        return (
            <TextInput
                label={label} size={15}
                marginBottom="10px"
                marginTop='7px'
                labelColor={cor}
                style={{ fontWeight: '500' }}
                className={classN}
            />
        );
    }

    registrarAnotacao(): void {
        const d = new Date();
        const zero = (i) => (i < 10) ? '0'.concat(i.toString()) : i.toString();
        const tituloDefinido = isDefined(getBCLS('input_titulo') as string);
        const formatoBrasileiro = zero(d.getDate()) + '/' + zero(d.getMonth()+1) + '/' + d.getFullYear();
        const horario = zero(d.getHours())+':'+zero(d.getMinutes())+':'+zero(d.getSeconds());

        inserirRegistro({
            titulo: this.criptar((tituloDefinido) ? it() as string : 'Sem titulo'),
            texto:  this.criptar(this.state.text),
            data:   this.criptar(formatoBrasileiro.concat(','+horario)),
            sentimento: this.criptar((isDefined(getBCLS('input_sentimento')) ? it() as string : 'Não definido'))
        });

        this.setState({ finalizado: true })
    }

    criptar(txt: string): string {
        return this.criptoUtils.encriptar(this.props.chaveMestra, txt);
    }

    render(): JSX.Element {
        const btnSalvar = ReactDOM.createPortal(
            <Button
                theme='dark'
                push
                color="#8dc955"
                style={this.BTN_ESTILO}
                onClick={() => this.setState({ salvar: true })}
            >Salvar nota
            </Button>, document.getElementById('btnLateral_esquerdo'));

        const PAINEL_ = (
            <>
                <PrimereactStyle />
                <div className='content-section implementation'
                    style={
                        {
                            width: '500px',
                            height: '500px'
                        }
                    }>
                    <Editor
                        value={this.state.text}
                        style={{ height: '314px' }}
                        onTextChange={e => this.setState({ text: e.htmlValue })}
                    />
                    {btnSalvar}
                </div>
            </>
        );

        const TELA_SALVAR = (
            <View
                layout='vertical' background='#63a8b0'
                horizontalAlignment='center'
                verticalAlignment='center'
                width="60%" height="300px"
                style={{ borderRadius: '8px' }}
                padding="20px 20px" margin="auto">

                {this.renderizarInput('Titulo', '#e4eb23', 'input_titulo')}
                {this.renderizarInput('Sentimento', '#e4eb23', 'input_sentimento')}
                <Button
                    push
                    theme='dark'
                    color='#8dc955'
                    style={{ marginBottom: '5px', marginTop: '10px', padding: '0px 45px' }}
                    onClick={() => this.registrarAnotacao()}
                >Salvar</Button>
                <Button
                    push
                    theme='dark'
                    color='#db3737'
                    style={{ marginTop: '5px' }}
                    onClick={() => this.setState({ salvar: false })}
                >Descartar</Button>
            </View>
        );

        if (this.state.finalizado) {
            return (
                <Box
                    padding="40px"
                    verticalAlignment='center'
                    margin='auto'
                    marginTop='60px'
                    layout='vertical'
                    style={{
                        borderRadius: '8px',
                        width: '65%',
                        height: '120px',
                        position: 'absolute',
                        top: '10%',
                        left: '10%'
                    }}
                    background='#d5eb7f'
                >
                    <Text
                        bold={500}
                        size="18px"
                        color='#400940'
                    >Muito bem! Anotar um sentimento/acontecimento é a melhor forma de desenvolvimento pessoal!
                    Espero que você continue anotando.</Text>
                    <Button
                        push
                        theme='dark'
                        padding='25px 70px'
                        color="#8dc955"
                        onClick={() => this.setState({
                            finalizado: false,
                            salvar: false,
                            text: ''
                        })}
                    >Voltar</Button>
                </Box>
            );
        }
        return (this.state.salvar && this.state.text !== '') ? TELA_SALVAR : PAINEL_;
    }
}
