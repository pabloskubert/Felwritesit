import React, { Component } from 'react';
import DiarioItem from './DiarioItem';

interface LixeiraProps { 
    chaveMestra: string;
}

export default class LixeiraItem extends Component<LixeiraProps> {
    
    constructor(props: LixeiraProps) {
        super(props);
    }

    render(): JSX.Element {
        return <DiarioItem lixeira={true} chaveMestra={this.props.chaveMestra} />
    }
}

