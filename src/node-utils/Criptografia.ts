import crypto from 'crypto';
import { getIV } from '../database/index';

export default class Cripto {
    
    private vetor: string;
    constructor() {   
        this.vetor = getIV();
    }
   
    public encriptar(chave: string, texto: string): string {
        chave = chave.slice(0, 32);
        const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(chave), Buffer.from(this.vetor));
        const cifrado = Buffer.concat([cipher.update(texto), cipher.final()]);
        return cifrado.toString('hex');
    }

    public decriptar(chave: string, textoCifrado: string): string {
        chave = chave.slice(0, 32);
        const cipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(chave), Buffer.from(this.vetor));
        const decriptar = Buffer.from(textoCifrado,'hex');

        let decifrado = undefined;
        try {
            decifrado = Buffer.concat([cipher.update(decriptar), cipher.final()]);
        } catch (error) {
            return 'WRONG-KEY';
        } finally { cipher.destroy() }

        return decifrado.toString();
    }
}

