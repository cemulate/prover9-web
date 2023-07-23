import baBasis from '../assets/example-input/ba-basis.txt?raw';

const defaultFiles = [{ name: 'Boolean Algebra 1-basis', input: baBasis, outputLines: [], lastInput: null }];

function loadFiles() {
    try {
        return JSON.parse(localStorage.getItem('files'));
    } catch {
        return defaultFiles;
    }
}

let saveTimeoutId = null;

function saveFiles(files) {
    localStorage.setItem('files', JSON.stringify(files));
}

function saveFilesAfterMs(files, ms = 5000) {
    if (saveTimeoutId != null) window.clearTimeout(saveTimeoutId);
    saveTimeoutId = window.setTimeout(() => saveFiles(files), ms);
}

export { loadFiles, saveFiles, saveFilesAfterMs };
