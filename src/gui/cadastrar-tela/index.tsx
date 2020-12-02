import Cadastro, { CadastroInfos, Registro } from './registrarUsuario';
import React, { PureComponent } from 'react';
import {
    TextInput, View, Button,
    Dialog
} from 'react-desktop';
import DiarioGUI from '../diario-tela/index';
import TelaLogin from '../login-tela/index';
import BANCO_DE_DADOS from '../../database/index';
import BackupUtils from '../../node-utils/Backup';
import AbrirArquivo from '../../node-utils/FileBrowser';

const getBCLS = function getByClassName(CLASS_NAME: string) {
    const doc = window.document.getElementsByClassName(CLASS_NAME)[0];

    if (doc instanceof HTMLInputElement) {
        return doc.value;
    }

    return doc;
}

interface Props {
    tema: string
    banco_de_dados: BANCO_DE_DADOS;
}

interface State {
    mensagem_erro: string;
    confirmarInfos: boolean;
    finalizado: boolean;
    efetuandoBkp: boolean;
    registrado: boolean;
    senhaHasheada: string;
    infosForm: {
        usuario: string;
        senha: string;
        email: string;
        dicaSenha: string;
        confirmarSenha: string;
    }
}

export default class TelaCadastro extends PureComponent<Props, State> {
    private cadastro: CadastroInfos;
    private readonly EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    private readonly USUARIO_REGEX = /^[A-Za-z]+$/;

    private readonly acao: Cadastro;
    private readonly bkpUtil: BackupUtils;
    constructor(props: Props | Readonly<Props>) {
        super(props);
        this.state = {
            mensagem_erro: '',
            confirmarInfos: false,
            registrado: false,
            finalizado: false,
            efetuandoBkp: false,
            senhaHasheada: '',
            infosForm: {
                usuario: '',
                email: '',
                senha: '',
                confirmarSenha: '',
                dicaSenha: '',
            }
        }

        this.acao = new Cadastro();
        this.bkpUtil = new BackupUtils();
        this.cadastro = {
            infoLogin: {
                nome: 'n/a',
                senha: '',
                validador: () => this.USUARIO_REGEX.test(getBCLS('input_nome') as string)
            },

            infosPessoal: {
                dicaSenha: '',
                email: '',
                validador: () => this.EMAIL_REGEX.test(getBCLS('input_email') as string)
            },
            validarSenha: () => {
                if (this.state.infosForm.confirmarSenha === '') return true;
                return this.state.infosForm.senha === getBCLS('input_confirmarSenha');
            }
        }
    }


    private inputsVazios(): boolean {
        let vazio = false;
        ['input_nome', 'input_email', 'input_senha', 'input_confirmarSenha', 'input_dica']
            .forEach((input_class) => {
                vazio = getBCLS(input_class) === '';
            });
        return vazio;
    }

    private getAllInfos(): Registro {
        return {
            nome: this.state.infosForm.usuario,
            senha: this.state.infosForm.senha,
            email: this.state.infosForm.email,
            dicaSenha: this.state.infosForm.dicaSenha
        }
    }

    private prosseguirRegistro() {
        /* verifica se todos os inputs foram preenchidos */
        let msg_erro =
            (!this.cadastro.infoLogin.validador())
                ? 'O nome não deve conter símbolos e números.'
                :
                (!this.cadastro.infosPessoal.validador())
                    ? 'O e-mail digitado é invalído.'
                    :
                    (this.cadastro.validarSenha()) ? '' : 'As senhas não coincidem.';

        if (this.inputsVazios()) {
            msg_erro = 'Preencha todos os campos!'; ''
        }

        this.setState({
            mensagem_erro: msg_erro, confirmarInfos: (msg_erro === ''),

            /* Salva as informações do formulário */
            infosForm: {
                usuario: getBCLS('input_nome') as string,
                email: getBCLS('input_email') as string,
                senha: getBCLS('input_senha') as string,
                dicaSenha: getBCLS('input_dica') as string,
                confirmarSenha: getBCLS('input_confirmarSenha') as string,
            }
        });
    }

    private efetuarRegistro() {
        const senha =
            this.acao.registrarNovo(this.getAllInfos()).slice(0, 32);
        this.setState({
            registrado: true,
            senhaHasheada: senha
        });
    }

    private btnBackup() {
        if (this.state.efetuandoBkp) return;
        const bkpAberto = AbrirArquivo.abrir();
        if (bkpAberto !== undefined) {

            this.setState({ efetuandoBkp: true });
            this.bkpUtil.importarBackup(bkpAberto[0], false, this.setState.bind(this));
        }
    }

    render(): JSX.Element {
        const telaCadastro_ = (
            <div style={{ width: '100%', height: '620px' }}>
                <h3 style={{ textAlign: 'center', width: '100%' }}>Antes de começar, crie uma conta para proteger o seu diário!</h3>

                <View width={730} height={400} style={{ color: 'orange' }}>
                    <View width={350} height={400} margin='0 0 0 15px' layout='vertical'>
                        <h3 style={{ textAlign: 'left', width: '100%' }}>Perfil</h3>

                        <TextInput style={{ fontWeight: '600' }} label='Nome' defaultValue={this.state.infosForm.usuario} width={210} className='input_nome' />
                        <TextInput style={{ fontWeight: '600' }} label='Email' defaultValue={this.state.infosForm.email} width={210} className='input_email' />
                        <Button push type='submit' theme='dark'
                            style={{
                                width: '75%',
                                position: 'absolute',
                                bottom: '5%',
                                paddingTop: '10px',
                                paddingRight: '10px',
                                paddingBottom: '10px',
                                paddingLeft: '10px'
                            }}
                            onClick={this.prosseguirRegistro.bind(this)}>Registrar nova conta!</Button>
                            {(this.state.mensagem_erro) &&
                                <p style={{
                                }}><strong>
                                        {this.state.mensagem_erro}
                                    </strong></p>
                            }

                    </View>

                    <View width={350} height={400} margin='0 0 0 15px' layout='vertical'>
                        <h3 style={{ textAlign: 'left', width: '100%' }}>Credenciais</h3>

                        <TextInput style={{ fontWeight: '600' }} label='Senha de acesso' defaultValue={this.state.infosForm.senha} width={210} password={true} className='input_senha' />
                        <TextInput style={{ fontWeight: '600' }} label='Digite novamente' defaultValue={this.state.infosForm.confirmarSenha} width={210} password={true} className='input_confirmarSenha' />
                        <TextInput style={{ fontWeight: '600' }} label='Dica de senha' defaultValue={this.state.infosForm.dicaSenha} placeholder='Isaac Newton, apple, tree' width={210} className='input_dica' />
                        <Button push type='submit' theme='dark'
                            style={{
                                width: '75%',
                                position: 'absolute',
                                bottom: '5%',
                                right: '0%',
                                paddingTop: '10px',
                                paddingRight: '5px',
                                paddingBottom: '10px',
                                paddingLeft: '5px'
                            }}
                            onClick={() => this.btnBackup()}>
                            {(this.state.efetuandoBkp) &&
                                <span>Importando backup...</span> ||
                                <span>Tenho um backup</span>
                            }
                        </Button>
                    </View>
                </View>
            </div>
        );

        const telaConfirmar = (
            <Dialog
                buttons={[
                    <Button push type="submit" theme="dark" key={1}
                        onClick={() => this.efetuarRegistro()}>Sim, compreendo.</Button>,

                    <Button push type="submit" theme="dark" key={2}
                        onClick={() => this.setState({ confirmarInfos: false })}>Não, quero revisar.</Button>
                ]}

                title='Revisão'
                message='A senha de acesso será usada para criptografar todo o conteúdo do seu diário, portanto uma vez
                    que sua senha foi perdida todo o conteúdo do seu diário será perdido, a criptografia usada é AES-256-CBC
                    para garantir que, mesmo que alguém invada o seu computador, todo o conteúdo do seu diário permanecerá secreto
                    Você tem plena certeza de não irá esquecer sua senha e o nome de usuário ?'
            />
        );


        if (this.state.registrado) {
            this.props.banco_de_dados.inicializarTabelas();
            return <DiarioGUI chaveMestra={this.state.senhaHasheada} />;
        }

        /* Se o backup foi feito, o arquivo 'autenticar' foi restaurado e é possível logar normalmente */
        if (this.state.finalizado) {
            return <TelaLogin />;
        }

        return (this.state.confirmarInfos) ? telaConfirmar : telaCadastro_;
    }
}