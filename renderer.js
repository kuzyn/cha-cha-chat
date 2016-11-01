// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

const ipc = require('electron').ipcRenderer;
var emoji = require('node-emoji');

// config object
let csConfigObject = {
    path: '',
    login: '',
    source: '',
    env_variable: {}
}

// open files
const binaryDirBtn = document.getElementById('binary-executable');
const testSrcBtn = document.getElementById('test-source');
const resultSrcBtn = document.getElementById('result-source');

// controls
const startBtn = document.getElementById('control-start');
const openButtons = [binaryDirBtn, testSrcBtn, resultSrcBtn];



///////////////
// HANDLERs  //
///////////////

// select files btn clicks
for (button of openButtons) {
  button.addEventListener('click', (event) => {
    ipc.send('open-file-dialog', event.srcElement.id);
  });
}

// control clicks
startBtn.addEventListener('click', (event) => {
  if (!csConfigObject.path || !csConfigObject.source) {
    ipc.send('open-error-dialog', 'You must select a binary and a source');
  } else {
    getEnvVariableValues('env-variable-key', 'env-variable-value', 'get');
    ipc.send('control-start-process', csConfigObject);
  }
});


// listeners for paths
ipc.on('binary-executable', (event, path) => {
  // do things with binary-executable
  csConfigObject.path = path;
  document.getElementById(`binary-executable-selected`).innerHTML = `${csConfigObject.path}`;
});

ipc.on('test-source', (event, path) => {
  // do things with test-source
  csConfigObject.source = path;
  document.getElementById(`test-source-selected`).innerHTML = `${csConfigObject.source}`;
});

ipc.on('result-source', (event, path) => {
  // do things with result-source
  resultSourcePath = path;
  document.getElementById(`result-source-selected`).innerHTML = `${resultSourcePath}`;
});


// listener for cs outputs
ipc.on('cs-binary-output', (event, output) => {
  // do things with result-source
  consoleOutput = output;
  document.getElementById(`output-console`).innerHTML += `<p>${consoleOutput}</p>`;
});


// if we have a config file, use these values
// de facto init function
ipc.on('default-config-load', (event, config) => {
  // do things with our configs
  csConfigObject = config;
  document.getElementById(`binary-executable-selected`).innerHTML = `${csConfigObject.path}`;
  document.getElementById(`test-source-selected`).innerHTML = `${csConfigObject.source}`;
  document.getElementById(`login-name`).value = `${csConfigObject.login}`;
  getEnvVariableValues('env-variable-key', 'env-variable-value', 'set');
  
  document.getElementById(`logo`).innerHTML = emoji.emojify(':dancer: :dancer: :heart_eyes_cat:');

});



/////////////
// HELPERS //
/////////////

// get or set all key/value of respective classes add them to csConfigObject.env_variable
function getEnvVariableValues(classNameKey, classNameValue, operation) {
  let keys = document.getElementsByClassName(classNameKey);
  let values = document.getElementsByClassName(classNameValue);
  
  // if we want to get our key/values
  if (operation === 'get') {
    // clear our object
    csConfigObject.env_variable = {}
    for (key of keys) {
      for (value of values) {
        if (key.dataset.variable === value.dataset.variable) {
          if (key.value && value.value) {
            csConfigObject.env_variable[key.value] = value.value;
          }
        }
      }
    }
  }
  
  // if we want to set our key/values to our config values
  if (operation === 'set') {
    let object = csConfigObject.env_variable;
    for (let variable in object) {
      let counter = 0;
      if (object.hasOwnProperty(variable) && object[variable]) {
        keys[counter].value = variable;
        values[counter].value = object[variable];
        counter += 1;
      }
    }
  }
  
}