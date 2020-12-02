const { dialog } = require('electron').remote;
const remote = require('electron').remote;

export default class AbrirBackup {
    static abrir(): undefined | string {
        return dialog.showOpenDialogSync(remote.getCurrentWindow(), {
            title: 'Abrir backup felwritesit',
            properties: ['openFile'],
            filters: [
                { name: 'Arquivo de backup', extensions: ['gzip'] }
            ]
        });
    }
}

