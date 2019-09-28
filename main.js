console.log("app process running");

const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const path = require('path');
const url = require('url');

let homeWindow;


function createWindow(){
    homeWindow = new BrowserWindow({width: 1024, height: 768});
    homeWindow.setMenu(null);
    homeWindow.loadURL(url.format({
        pathname: path.join(__dirname, '/dist/index.html'),
        protocol: 'file',
        slashes: true
    }));
    homeWindow.webContents.openDevTools();
       
    homeWindow.on('closed', () => {
        homeWindow = null;
    });
}

function setWindow(){
    const screen = electron.screen;
    const mainScreen = screen.getPrimaryDisplay();
    const dimensions = mainScreen.size;
    homeWindow.setSize(dimensions.width, dimensions.height);
}
app.on('ready', createWindow);
app.on('ready', setWindow);
app.on('window-all-closed', () => {
    if(process.platform !== 'darwin'){
        app.quit();
    }
});

app.on('activate', () => {
    if(homeWindow === null){
        createWindow();
    }
});