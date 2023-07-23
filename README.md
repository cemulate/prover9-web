# prover9-web

This is a proof of concept for running [Prover9](https://www.cs.unm.edu/~mccune/prover9/) (and Mace4) in the browser with WebAssembly.
You can [try it here](https://cemulate.github.io/prover9-web).

Currently, it's a very direct port that simply runs Prover9 on a plain input file and displays the console output, but can serve as a base for building something on top of Prover9/Mace4 in the future.

The [prover9-wasm](https://github.com/cemulate/prover9-wasm) repo holds the source code and produces the JS and WASM binaries used here.
