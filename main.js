const electron = require('electron');
// Module to control application life.
const app = electron.app;
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow;
const ipc = require('electron').ipcMain;
const dialog = require('electron').dialog;
const exec = require('child_process').exec;
const os = require('os');
const fs = require('fs');
const config = require('./config.js');

require('electron-reload')(__dirname);

let csProcess;

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

function createWindow () {
  // Create the browser window.
  mainWindow = new BrowserWindow({width: 800, height: 600});

  // and load the index.html of the app.
  mainWindow.loadURL(`file://${__dirname}/index.html`);

  // Open the DevTools.
  //mainWindow.webContents.openDevTools()
  
  mainWindow.webContents.on('did-finish-load', () => {
    // check if we have a proper config file in the local folder
    try {
      if (config.root && config.source && config.login) {
        console.log(`config loaded: ${JSON.stringify(config)}`);
        mainWindow.webContents.send('default-config-load', config);
      } else {
        throw new Error('empty field(s) in config.js');
      }
    } 
    catch (e) {
      console.log(`${e}`);
    }
  })

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
})

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

// listen for open dialog requests
ipc.on('open-file-dialog', function (event, element) {
  
  let dialogOptions = {
    defaultPath: process.cwd(),
    properties: ['openFile']
  }
  
  dialog.showOpenDialog(dialogOptions, function (files) {
    if (files) {
      event.sender.send(element, files);
    }
  });
})

ipc.on('control-stop-process', function (event) {
  if (csProcess) {
    csProcess.kill();
    csProcess = null;
    event.sender.send('cs-process-kill', 'csProcess killed');
  } else {
    event.sender.send('cs-process-kill', 'csProcess is not running');
  }
});

// listen for a start process request
ipc.on('control-start-process', function (event, options) {
  console.log(options);
  
  // first we set our env variable
  let object = options.env_variable;
  for (let variable in object) {
    if (object.hasOwnProperty(variable)) {
      process.env[variable] = object[variable];
    }
  }
  
  // then we decide of our binary
  let binaryFile = process.platform === 'darwin' ? '/BINARIES/MacChatScript' : process.platform === 'linux' ? '/BINARIES/ChatScript' : '\\BINARIES\\chatscript.exe'
  
  csProcess = exec(`${options.root}${binaryFile} local login=${options.login} root=${options.root} source=${options.source}`);
  csProcess.stdout.on('data', function(data) {
    console.log('stdout: ' + data);
    event.sender.send('cs-process-output', data);
  });
  csProcess.stderr.on('data', function(data) {
      // console.log('stderr: ' + data);
      //Here is where the error output goes
  });
  csProcess.on('close', function(code) {
      // console.log('closing code: ' + code);
      //Here you can get the exit code of the script
      event.sender.send('cs-process-end', code);
  });
  // event.sender.send('cs-process-output', data);
})

// listen for errors
ipc.on('open-error-dialog', function (event, errorText) {
  dialog.showErrorBox('Error', errorText);
})
