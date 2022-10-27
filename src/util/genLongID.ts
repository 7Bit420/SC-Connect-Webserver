export function genLongID() {
    return "xxxxxxxxxx-xxxxxxx-xxxxx-xxxxxxx-xxxxxxxxxx"
        .replace(/x/g, () => String.fromCharCode(Math.floor(Math.random() * 26) + 97));
}
