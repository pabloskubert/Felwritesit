import {
    app, BrowserWindow
} from 'electron';
import { initSplashScreen, DolphinTemplate } from 'electron-splashscreen';

const WEBPACK_DEV_SERVER = 'http://localhost:8000';
const WEB_INTERFACE_ARQ  = './public/index.html';

const AMBIENTES = ['production', 'development'];
process.env.NODE_ENV = AMBIENTES[1];

let janela: BrowserWindow;
function criarJanela() {
    janela = new BrowserWindow ({
        width: 750,
        height: 500,
        maximizable: false,
        resizable: false,
        fullscreen: false,
        fullscreenable: false,
        center: true,
        show: false,
        title: 'Felwritesit',
        webPreferences: {
            devTools: (process.env.NODE_ENV === 'development'),
            nodeIntegration: true,
            enableRemoteModule: true
        }
    });

    janela.menuBarVisible = false;
    const ocultarSplash = initSplashScreen({
        mainWindow: janela,
        width: 600,
        height:400,
        url: DolphinTemplate,
    });

    janela.once('ready-to-show', () => {
        janela.show();
        ocultarSplash();
    });

    const carregado = (process.env.NODE_ENV === 'development')
    ? janela.loadURL(WEBPACK_DEV_SERVER)
    : janela.loadFile(WEB_INTERFACE_ARQ);
}

app.whenReady().then(criarJanela);
