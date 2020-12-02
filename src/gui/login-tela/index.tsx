import fs from 'fs';
import hasha from 'hasha';
import React,{ PureComponent } from 'react';
import { 
    View, TextInput, 
    Button } from 'react-desktop';
import { getBCLS } from '../DomUtils';
import { ARQ_AUTENTICACAO_CAMINHO } from '../../Configuracoes';
import DiarioGUI from '../diario-tela/index';

interface LoginState {
    usuario: string;
    logado: boolean;
    erro: boolean;
    erro_msg: string;
    tentativas: number;
    senha: string;
}

interface VoidProps { u?: string }
export default class TelaLogin extends PureComponent<VoidProps, LoginState> {

    private readonly infosLogin: {
        u: string;
        s: string;
        d: string;
        e: string;
    };

    private readonly EXIBIR_DICA_EM = 3;
    constructor(props: VoidProps) {
        super(props);
        this.state = {
            usuario: '',
            logado: false,
            erro: false,
            erro_msg: '',
            tentativas: 0,
            senha: '',
        }

        const  DADOS_JSON = fs.readFileSync(ARQ_AUTENTICACAO_CAMINHO).toString();
        this.infosLogin = JSON.parse(DADOS_JSON);
    }

    private readonly CONTAINER_LOGIN = {
        position: 'absolute',
        top: '15%',
        left: '30%'
    }

    private logar(): void {
        const infos = {
            usuario: getBCLS('input_nome'),
            senha: getBCLS('input_senha')
        }

        const senhaDigitada = hasha(infos.senha as string, { algorithm: 'sha512' });
        const senhaIgual = this.infosLogin.s === senhaDigitada;
        const usuarioIgual = this.infosLogin.u === infos.usuario;

        const msg_err = ([infos.usuario, infos.senha].includes(''))
            ? 'Preencha todos os campos' :
            (!senhaIgual || !usuarioIgual)
            ? 'Usuário ou senha incorretos.' : '';
        const ocorreuErro = msg_err !== '';

        const tentativasTot = this.state.tentativas + 1;
        this.setState({
            usuario: infos.usuario as string,
            logado: !ocorreuErro,
            erro: ocorreuErro,
            erro_msg: msg_err,
            tentativas: tentativasTot,
            senha: senhaDigitada.slice(0,32)
        });
    }

    render(): JSX.Element {
        const TELA_LOGIN = ( 
            <div style={{ width:"600", height:"500"}}>
                <View style={this.CONTAINER_LOGIN} margin='auto' width={400} height={350} layout='vertical'>
                    { (this.state.tentativas >= this.EXIBIR_DICA_EM) 
                        && <h4 style={{ color:  'green'}}>Dica: {this.infosLogin.d}</h4>
                        || <h4>Passe as credenciais, e você poderá prosseguir.</h4>
                    }
                    
                    <TextInput width={200} style={{fontWeight: '600'}} label='Nome' className='input_nome' 
                    defaultValue={this.infosLogin.u} />
                    <TextInput width={200} style={{fontWeight: '600'}} label='Senha' 
                    className='input_senha' password={true} />
                    <Button style={{width: '60%'}} push type='submit' onClick={() => this.logar()}>Entrar</Button> 
                    
                    { this.state.erro && 
                        <p style={{
                            color: 'red',
                        }}>
                            <strong>{this.state.erro_msg}</strong>
                        </p>
                    }

                </View>
            </div>
        );

        return (this.state.logado)
            ? <DiarioGUI chaveMestra={this.state.senha} />
            : TELA_LOGIN;
    }
}