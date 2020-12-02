import fs from 'fs';

import appUtils from '../node-utils/appUtils';
import Armazenamento from '../database/index';
import { DATABASE_ARQ } from '../Configuracoes';

import React, { Component } from 'react';
import { Window } from 'react-desktop';
import TelaCadastro from './cadastrar-tela/index';
import TelaLogin from './login-tela/index';

interface AppProps {
    color: string,
    theme: string
}

interface State {
    travarApp: boolean;
}

export default class FelwritesitIndex extends Component<AppProps, State> {
    private readonly DB_INICIADO;

    constructor(props: AppProps) {
        super(props);


        const iniciarTabelas = 
            (!fs.existsSync(DATABASE_ARQ) || fs.statSync(DATABASE_ARQ).size === 0);

        this.DB_INICIADO = new Armazenamento();
        if (iniciarTabelas)
            this.DB_INICIADO.inicializarTabelas();
    }

    static defaultProps = {
        color: '#cc7f29',
        theme: 'white'
    }

    render(): JSX.Element {
        const exibirTela = (appUtils.jaRegistrado())
            ? <TelaLogin />
            : <TelaCadastro banco_de_dados={this.DB_INICIADO} tema='dark' />;

        return (
            <Window
                color={this.props.color}
                theme={this.props.theme}
                width="730px"
                height="460px"
                style={{ fontFamily: "Segoe UI" }}
            >
                {exibirTela}
            </Window>
        );
    }
}
