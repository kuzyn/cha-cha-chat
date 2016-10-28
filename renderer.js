// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

const ipc = require('electron').ipcRenderer;

let csConfigObject = {
    path: '',
    login: 'test',
    source: ''
}

// open files
const binaryDirBtn = document.getElementById('binary-executable');
const testSrcBtn = document.getElementById('test-source');
const resultSrcBtn = document.getElementById('result-source');

// controls
const startBtn = document.getElementById('control-start');


const openButtons = [binaryDirBtn, testSrcBtn, resultSrcBtn];


// handlers

// select files btn clicks
for (button of openButtons) {
  button.addEventListener('click', function (event) {
    ipc.send('open-file-dialog', event.srcElement.id);
  });
}

// control clicks
startBtn.addEventListener('click', function (event) {
  if (!csConfigObject.path || !csConfigObject.source) {
    ipc.send('open-error-dialog', 'You must select a binary and a source');
  } else {
    ipc.send('control-start-process', csConfigObject);
  }
});



// listeners
ipc.on('binary-executable', function (event, path) {
  // do things with binary-executable
  csConfigObject.path = path;
  document.getElementById(`binary-executable-selected`).innerHTML = `${path}`
});

ipc.on('test-source', function (event, path) {
  // do things with test-source
  csConfigObject.source = path;
  document.getElementById(`test-source-selected`).innerHTML = `${path}`
});

ipc.on('result-source', function (event, path) {
  // do things with result-source
  resultSourcePath = path;
  document.getElementById(`result-source-selected`).innerHTML = `${path}`
});


