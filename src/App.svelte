<script>
    import { afterUpdate } from 'svelte';
    import { loadFiles, saveFilesAfterMs } from './lib/files.js';

    let files = loadFiles();
    let selectedFileIndex = 0;
    let editingSelectedFileName = false;

    $: selectedFile = files?.[selectedFileIndex];
    $: selectedFileEdited = selectedFile.input != selectedFile.lastInput;

    const worker = new Worker(new URL('./lib/prover9.worker.js', import.meta.url), { type: 'module' });

    worker.onmessage = ({ data }) => {
        if (data.type == 'stdout' || data.type == 'stderr') {
            selectedFile.outputLines.push(data);
            selectedFile.outputLines = selectedFile.outputLines;
        } else if (data.type == 'done') {
            running = false;
        }
    };

    let running = false;

    function runProver9() {
        running = true;
        selectedFile.outputLines = [];
        selectedFile.lastInput = selectedFile.input;
        worker.postMessage({ stdin: selectedFile.input });
    }

    function handleShortcuts(event) {
        if (event.key == 'Enter' && event.ctrlKey) {
            event.preventDefault();
            runProver9();
        }
    }

    function newFile(event) {
        files.push({ name: 'Untitled', input: '', outputLines: [], lastInput: null });
        files = files;
        selectedFileIndex = files.length - 1;
    }

    $: saveFilesAfterMs(files);

    let programOutputEl, nameInputEl;

    afterUpdate(() => {
        if (selectedFile.outputLines) programOutputEl.scrollTop = programOutputEl.scrollHeight;
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
                                <input
                                    type="text"
                                    bind:this={nameInputEl}
                                    class="name-input"
                                    bind:value={selectedFile.name}
                                    on:change={e => (editingSelectedFileName = false)}
                                    on:focusout={e => (editingSelectedFileName = false)}
                                    on:focus={e => e.target.select()}
                                />
                            {:else}
                                <a
                                    href="#"
                                    class="pure-menu-link"
                                    on:click={e =>
                                        selectedFileIndex != index
                                            ? (selectedFileIndex = index)
                                            : (editingSelectedFileName = true)}>{file.name}</a
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
                    disabled={!selectedFileEdited}
                    class:pure-button-disabled={!selectedFileEdited}
                    on:click={runProver9}>Run (Ctrl + ⏎)</button
                >
            </div>
        </div>
        <textarea class="textarea mono program-input" bind:value={selectedFile.input} on:keydown={handleShortcuts} />
        <div class="block mono program-output" class:out-of-date={selectedFileEdited} bind:this={programOutputEl}>
            {#each selectedFile.outputLines as line}
                <span class="console-line" class:stderr={line.type == 'stderr'}>{@html line.content}</span>
            {/each}
        </div>
    </div>
</main>

<style lang="postcss">
    :global(html) {
        overflow: hidden;
    }
    textarea {
        border: 1px solid lightgray;
        border-radius: 0.25em;
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
    .program-input {
        padding: 0.5em;
    }
    .program-output {
        box-sizing: border-box;
        background: #fafafa;
        padding: 0.5em;
        overflow: auto;
        height: 100%;
        padding-bottom: 1em;

        &.out-of-date {
            opacity: 75%;
        }
    }
    .console-line {
        display: block;
        font-family: monospace;
        width: 100%;
        margin-bottom: 0.1em;
        padding: 0;

        &.stderr {
            color: red;
        }
    }
    .new-menu-item {
        margin-top: 0.5em;
        text-align: center;
        > a {
            font-size: 1.5em;
            font-weight: bold;
        }
    }
    .name-input {
        padding: 0.3em;
        box-sizing: border-box;
        width: 100%;
    }
</style>
