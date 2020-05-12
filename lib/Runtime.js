class Stack {
    constructor(size, defGen) {
        let st = [];
        for (let i = 0; i < size; i++) {
            st.push(defGen());
        }
        this.stack = st;
        this.size = size;
        this.defGen = defGen;
        this.pointer = 0;
    }

    getIndex(offset) {
        return (this.pointer + offset) % this.size;
    }

    at(offset) {
        return this.stack[this.getIndex(offset)];
    }

    rollDown(n) {
        let res = (this.pointer - n) < 0 ? this.size - Math.abs(this.pointer - n) : this.pointer - n;
        this.pointer = res % this.size;
    }

    push(obj) {
        obj = obj || this.at(0);
        this.stack[this.getIndex(this.size - 1)] = this.defGen();
        this.rollDown(1);
        this.stack[this.pointer] = obj;
    }
}


function evaluate(ast, sVars, sPrim) {
    let vars = {};
    let prim = {}
    Object.assign(vars, sVars);
    Object.assign(prim, sPrim);

    function evaluateStatement(ast) {

    }
    
    function evaluateBase(ast) {
        ast.s.forEach(s => {
            evaluateStatement(s);
        });
    }

    evaluateBase(ast);
}