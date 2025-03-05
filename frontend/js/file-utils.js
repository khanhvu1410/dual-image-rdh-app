export function formatBytes(bytes, decimals = 2) {
    if (!+bytes) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export function shortenName(name, maxLength) {
    let fileName = "";
    if (name.length > maxLength) {
        for (let j = 0; j < maxLength; j++) {
            fileName += name[j];
        }
        fileName += "..."; 
    } else {
        fileName = name;
    }
    return fileName;
}

export const isFileEqual = async (file1, file2) => {
    return new Promise((resolve) => {
        blobCompare.default.isEqual(file1, file2)
            .then(result => resolve(result))
            .catch(() => resolve(false));
    });
};