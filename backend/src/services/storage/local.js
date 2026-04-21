const fs = require('fs');
const path = require('path');

const ROOT = process.env.STORAGE_PATH
    ? path.resolve(process.env.STORAGE_PATH)
    : path.resolve(__dirname, '../../../storage');

function resolveKey(key) {
    if (key.includes('..')) {
        throw new Error('Invalid storage key');
    }
    return path.join(ROOT, key);
}

async function put(key, buffer) {
    const filePath = resolveKey(key);
    await fs.promises.mkdir(path.dirname(filePath), { recursive: true });
    await fs.promises.writeFile(filePath, buffer);
}

function get(key) {
    return fs.createReadStream(resolveKey(key));
}

async function remove(key) {
    const filePath = resolveKey(key);
    try {
        await fs.promises.unlink(filePath);
    } catch (err) {
        if (err.code !== 'ENOENT') throw err;
    }
}

async function exists(key) {
    try {
        await fs.promises.access(resolveKey(key));
        return true;
    } catch {
        return false;
    }
}

module.exports = { put, get, remove, exists, ROOT, publicBase: '/files' };
