// prover9.js is produced by Emscripten, compiled with the following settings:
// -sALLOW_MEMORY_GROWTH
// -sMODULARIZE
// -sEXPORT_ES6
// -sUSE_ES6_IMPORT_META=0
// -sENVIRONMENT=web
// -sEXPORT_NAME='Prover9'
// -sINVOKE_RUN=0
// -sEXPORTED_RUNTIME_METHODS=['callMain']
import Prover9 from './prover9.js';

import wasmBinaryHex from '../assets/prover9.wasm?raw-hex';
const wasmBinary = Uint8Array.from(wasmBinaryHex.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));

function* iterateChars(s) {
    let i = 0;
    while (i < s.length) {
        yield s.charCodeAt(i);
        i++;
    }
    yield null;
}

function accumulateIntoLines(lineCallback) {
    let curLine = '';
    return charCode => {
        let ch = String.fromCharCode(charCode);
        if (ch == '\n') {
            lineCallback(curLine);
            curLine = '';
        } else {
            curLine += ch;
        }
    };
}

const wasmMemory = new WebAssembly.Memory({
    // Emscripten defaults from settings.js (16MB - 2GB)
    // in units of 64KB WASM pages
    initial: 16777216 / 65536,
    maximum: 2147483648 / 65536,
});

self.onmessage = async ({ data: { stdin } }) => {
    let stdinGen = iterateChars(stdin);

    const prover9 = await Prover9({
        wasmBinary,
        wasmMemory,
        stdin: () => stdinGen.next().value,
        stdout: accumulateIntoLines(line => self.postMessage({ type: 'stdout', content: line })),
        stderr: accumulateIntoLines(line => self.postMessage({ type: 'stderr', content: line })),
    });
    let exitCode = prover9.callMain();
    self.postMessage({ type: 'done', exitCode });
};
