import baBasis from '../assets/example-input/ba-basis.txt?raw';

const defaultFiles = [{ name: 'Boolean Algebra 1-basis', input: baBasis, output: '', lastInput: null }];

function validateFiles(files) {
    for (let f of files) {
        for (let key of ['name', 'input', 'output']) {
            if (typeof f[key] != 'string') throw new Error('Invalid saved files.');
        }
        if (f.lastInput != null) throw new Error('Invalid saved files.');
    }
}

function loadFiles() {
    let data = localStorage.getItem('files');
    if (data == null) return defaultFiles;
    try {
        let files = JSON.parse(data);
        validateFiles(files);
        return files;
    } catch (e) {
        console.error(e);
        return defaultFiles;
    }
}

let saveTimeoutId = null;

function saveFiles(files) {
    let f = files.map(({ name, input, output }) => ({ name, input, output, lastInput: null }));
    localStorage.setItem('files', JSON.stringify(f));
}

function saveFilesAfterMs(files, ms = 5000) {
    if (saveTimeoutId != null) window.clearTimeout(saveTimeoutId);
    saveTimeoutId = window.setTimeout(() => saveFiles(files), ms);
}

function* extractProofsFromOutput() {
    const PROOF_START = '============================== PROOF =================================';
    const PROOF_END = '============================== end of proof ==========================';
    let proofFlag = false;
    let curProof = '';
    let curLine = yield;
    while (true) {
        let isStart = curLine == PROOF_START,
            isEnd = curLine == PROOF_END;
        if (isStart || isEnd || proofFlag) curProof += curLine + '\n';
        proofFlag = isStart ? true : isEnd ? false : proofFlag;
        curLine = isEnd ? yield curProof : yield;
    }
}

export { loadFiles, saveFiles, saveFilesAfterMs, extractProofsFromOutput };
