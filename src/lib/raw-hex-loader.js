import { readFile } from 'fs/promises';

export default {
    name: 'raw-hex-loader',
    async transform(code, id) {
        const [path, query] = id.split('?');
        if (query != 'raw-hex') return null;

        const data = await readFile(path);
        const hex = data.toString('hex');

        return `export default '${hex}';`;
    },
};
