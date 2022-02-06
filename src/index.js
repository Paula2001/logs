const { app, BrowserWindow ,ipcMain } = require('electron');
const path = require('path');
const mysql8 = require('./databases/mysql8');
const prompt = require('electron-prompt');

let database ;
let mainWindow ;
// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  // eslint-disable-line global-require
  app.quit();
}
const createWindow = () => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    webPreferences: {
      enableRemoteModule: true,
      nodeIntegration: true,
      contextIsolation: false,
    },
    icon: path.join(__dirname, '/fire.ico'),
    width: 800,
    height: 600,
  });
  mainWindow.setIcon(path.join(__dirname, '/fire.png'));
  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, 'index.html'));
  mainWindow.maximize();
  // Open the DevTools.
  // mainWindow.webContents.openDevTools();
};

ipcMain.handle("connectToDatabase",async (event, arg) => {
  database = new mysql8();
  try {
    const connection = await database.connect(arg);
    if (connection){
      mainWindow.loadFile(path.join(__dirname, 'logs.html'));
    }
    return false;
  }catch (e){
    return e;
  }
});

ipcMain.handle("editGeneralLogsStatus",async (event, arg) => {
  await database.editGeneralLogsStatus(arg);
});

ipcMain.handle("editPathOfGeneralLogs",async (event, arg) => {
  await database.editPathOfGeneralLogs(arg);
});

ipcMain.handle("getGeneralLogsStatus",async (event, arg) => {
  return await database.returnGeneralLogsStatus();
});

ipcMain.handle("getGeneralLogsFilePath",async (event, arg) => {
  return await database.returnGeneralLogsFile();
});

ipcMain.handle("getUserRootPassword", async (event, arg) => {
  try {
    return await prompt({
      title: 'Root Password',
      label: 'Please enter your root password:',
      value: '',
      inputAttrs: {
        type: 'password'
      },
      type: 'input'
    });

  }catch (e) {
      return e;
  };
});


app.on('ready', createWindow);

ipcMain.handle('close-app', async () => {
  if (database){
    await database.closeConnection();
  }
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('window-all-closed', async () => {
  if (database){
    await database.closeConnection();
  }
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
