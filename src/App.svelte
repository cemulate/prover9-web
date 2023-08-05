<script>
    import { afterUpdate } from 'svelte';
    import { loadFiles, saveFilesAfterMs, extractProofsFromOutput } from './lib/util.js';

    let files = loadFiles();
    let selectedFileIndex = 0;
    let editingSelectedFileName = false;

    $: selectedFile = files?.[selectedFileIndex];
    $: selectedFileEdited = selectedFile.input != selectedFile.lastInput;

    let runningFile = null;

    const worker = new Worker(new URL('./lib/prover9.worker.js', import.meta.url), { type: 'module' });

    const outputProcessor = extractProofsFromOutput();
    worker.onmessage = ({ data }) => {
        if (data.type == 'stdout') {
            let result = outputProcessor.next(data.content);
            if (result.value != null) runningFile.output += result.value;
        } else if (data.type == 'stderr') {
            runningFile.output += data.content + '\n';
        } else if (data.type == 'done') {
            runningFile = null;
        }
        saveFilesAfterMs(files, 0);
        files = files;
    };

    function runProver9() {
        runningFile = selectedFile;
        if (runningFile == null) return;
        runningFile.output = '';
        runningFile.lastInput = runningFile.input;
        worker.postMessage({ stdin: runningFile.input });
    }

    function handleShortcuts(event) {
        if (event.key == 'Enter' && event.ctrlKey) {
            event.preventDefault();
            runProver9();
        }
    }

    function newFile(event) {
        files.push({ name: 'Untitled', input: '', output: '', lastInput: null });
        files = files;
        selectedFileIndex = files.length - 1;
    }

    function deleteSelectedFile(event) {
        files.splice(selectedFileIndex, 1);
        files = files;
        selectedFileIndex = Math.max(selectedFileIndex - 1, 0);
    }

    $: saveFilesAfterMs(files);

    let programOutputEl, nameInputEl;

    afterUpdate(() => {
        if (selectedFile.output.length > 0) programOutputEl.scrollTop = programOutputEl.scrollHeight;
        if (nameInputEl) nameInputEl.focus();
    });
</script>

<main>
    <div class="grid-root">
        <div class="sidebar">
            <aside class="pure-menu file-list">
                <ul class="pure-menu-list">
                    {#each files as file, index}
                        <li class="pure-menu-item" class:pure-menu-selected={selectedFileIndex == index}>
                            {#if editingSelectedFileName && selectedFileIndex == index}
                                <div class="name-edit-view">
                                    <input
                                        type="text"
                                        bind:this={nameInputEl}
                                        class="name-input"
                                        bind:value={selectedFile.name}
                                        on:change={e => (editingSelectedFileName = false)}
                                        on:focusout={e => (editingSelectedFileName = false)}
                                        on:focus={e => e.target.select()}
                                    />
                                    <button class="pure-button" on:mousedown={deleteSelectedFile}>×</button>
                                </div>
                            {:else}
                                <a
                                    href="#"
                                    class="pure-menu-link"
                                    on:click={e =>
                                        selectedFileIndex != index
                                            ? (selectedFileIndex = index)
                                            : (editingSelectedFileName = true)}
                                    >{file.name} {file == runningFile ? '(...)' : ''}</a
                                >
                            {/if}
                        </li>
                    {/each}
                    <li class="pure-menu-item new-menu-item">
                        <a href="#" class="pure-menu-link" on:click={newFile}><span>+</span></a>
                    </li>
                </ul>
            </aside>
            <div>
                <p>
                    Prover9 <a href="https://www.cs.unm.edu/~mccune/prover9/manual/2009-11A/">Documentation</a> and
                    <a href="https://www.cs.unm.edu/~mccune/prover9/examples/2009-11A/">Examples</a>
                </p>
                <p>
                    See the <a href="#">README</a> for more information about this web app.
                </p>
            </div>
            <div>
                <button
                    style="width: 100%"
                    class="pure-button pure-button-primary"
                    disabled={!selectedFileEdited || runningFile != null}
                    class:pure-button-disabled={!selectedFileEdited || runningFile != null}
                    on:click={runProver9}>Run (Ctrl + ⏎)</button
                >
            </div>
        </div>
        <textarea
            class="textarea mono"
            bind:value={selectedFile.input}
            on:keydown={handleShortcuts}
            disabled={selectedFile == runningFile}
        />
        <textarea
            class="textarea mono program-output"
            readonly
            bind:this={programOutputEl}
            value={selectedFile.output}
        />
    </div>
</main>

<style lang="postcss">
    :global(html) {
        overflow: hidden;
    }
    textarea {
        border: 1px solid lightgray;
        border-radius: 0.25em;
        padding: 0.5em;
        &:focus-visible {
            outline: lightgray auto 1px;
        }
    }
    .grid-root {
        height: 100vh;
        display: grid;
        grid-template-columns: 15em 1fr 1fr;
    }
    .sidebar {
        display: flex;
        flex-direction: column;
        padding: 0.5em;

        > .file-list {
            flex-grow: 1;
        }
    }
    .mono {
        font-family: monospace;
        font-size: 1.1em;
    }
    .program-output {
        background: #fafafa;
        white-space: pre;
    }
    .new-menu-item {
        margin-top: 0.5em;
        text-align: center;
        > a {
            font-size: 1.5em;
            font-weight: bold;
        }
    }
    .name-edit-view {
        padding: 0.3em;
        display: flex;
        width: 100%;

        > input {
            flex-grow: 1;
        }

        > button {
            padding: 0.2em 0.5em 0.2em 0.5em;
            font-style: bold;
            font-size: 1.2em;
        }
    }
</style>
