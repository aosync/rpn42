module.exports = class Num {
    constructor(content) {
        let b = [];
        let a = [];
        let dot = false;
        for (let i = 0; i < content.length; i++) {
            if (content[i] === '.') { dot = true; continue; }
            if (!dot) b.push(parseInt(content[i]));
            else a.push(parseInt(content[i]));
        }
        this.b = b;
        this.a = a;
    }
};