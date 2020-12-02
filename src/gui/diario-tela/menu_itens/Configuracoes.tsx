import React, { Component } from 'react';
import {
    View
} from 'react-desktop';

export default class Configs extends Component {
    private readonly CONTAINER_ESTILO = {
        backgroundColor: '#dbdad5',
        margin: 'auto',
        boxShadow: '2px',
        borderRadius: '5px',
        padding: '15px',
    }

    private readonly LIMITAR = {
        width: '500px'
    }

    render(): JSX.Element {
        return (
            <div style={this.LIMITAR}>
                <View width="80%" height="350px" style={this.CONTAINER_ESTILO}
                    layout='vertical'
                    horizontalAlignment='center'
                >
                    <h4>Opção em desenvolvimento</h4>
                </View>
            </div>
        );
    }
}

