const TokenType = {
    PRIM: 0,
    NUMB: 1,
    OPER: 2,
    COMP: 3,
};
Object.freeze(TokenType);

const LexerTokenType = {
    IDENT: 0,
    NUMBER: 1,
    LBL: 2,
    RTN: 3,
    XEQ: 4,
    GT: 5,
    GE: 6,
    LT: 7,
    LE: 8,
    STO: 9,
    RCL: 10,
    PLUS: 11,
    MINUS: 12,
    MULTIPLY: 13,
    DIVIDE: 14,
};
Object.freeze(LexerTokenType);

module.exports.LexerTokenType = LexerTokenType;

class Token {
    constructor(t, c) {
        this.type = t;
        this.content = c;
    }
}

module.exports.Token = Token;

function isLetterChar(c) {
    if (!c) return false;
    return (c.match(/[a-z]/i) ? true : false);
}

function isNameChar(c) {
    if (!c) return false;
    return (c.match(/[a-z0-9]/i) ? true : false);
}

function isNumberChar(c) {
    if (!c) return false;
    return (c.match(/[0-9.]/) ? true : false);
}

function isOperationChar(c) {
    if (!c) return false;
    return (c.match(/[+*/-]/) ? true : false);
}

function isComparisonChar(c) {
    if (!c) return false;
    return (c.match(/[><]/) ? true : false);
}

function isEqualChar(c) {
    if (!c) return false;
    return (c === '=');
}

function isPrimitive(code) {
    let primitive = '';

    if (isLetterChar(code[0])) {
        primitive += code.shift();
    }
    else return null;

    while (isNameChar(code[0])) {
        primitive += code.shift();
    }
    return primitive;
}

function isWhitespace(code) {
    let has = false;
    while (code[0] == ' ') {
        has = true;
        code.shift();
    }
    return has;
}

function isNumber(code) {
    let number = '';
    while (isNumberChar(code[0])) {
        number += code.shift();
    }

    if (number !== '') {
        return number;
    }
    return null;
}

function isOperation(code) {
    let operation = '';
    if (isOperationChar(code[0])) {
        operation = code.shift();
        return operation;
    }
    return null;
}

function isComparison(code) {
    let comparison = '';
    if (isComparisonChar(code[0])) {
        comparison = code.shift();
    }
    else return null;

    if (isEqualChar(code[0])) {
        comparison += code.shift();
    }
    return comparison;
}

module.exports.Tokenize = function (source) {
    let tokenStream = [];
    let sourceArray = source.split('');
    while (sourceArray.length > 0) {
        let p = isPrimitive(sourceArray);
        if (p) { tokenStream.push(new Token(TokenType.PRIM, p)); continue; }
        let n = isNumber(sourceArray);
        if (n) { tokenStream.push(new Token(TokenType.NUMB, n)); continue; }
        let o = isOperation(sourceArray);
        if (o) { tokenStream.push(new Token(TokenType.OPER, o)); continue; }
        let c = isComparison(sourceArray);
        if (c) { tokenStream.push(new Token(TokenType.COMP, c)); continue; }
        let hw = isWhitespace(sourceArray);
        if (!hw) {
            throw new Error(`Tokenizer error: invalid character ${sourceArray[0]}`);
        }
    }
    return tokenStream;
};

function primitiv(p) {
    if (p === 'lbl') return LexerTokenType.LBL;
    else if (p === 'rtn') return LexerTokenType.RTN;
    else if (p === 'xeq') return LexerTokenType.XEQ;
    else if (p === 'sto') return LexerTokenType.STO;
    else if (p === 'rcl') return LexerTokenType.RCL;
    else return LexerTokenType.IDENT;
}

function nummer(p) {
    dotC = 0;
    for (let i = 0; i < p.length; i++) {
        if (p[i] === '.') dotC++;
    }
    if (dotC > 1) throw new Error('Lexer error: invalid number');
    return LexerTokenType.NUMBER;
}

function comparizon(p) {
    if (p === '>') return LexerTokenType.GT;
    else if (p === '<') return LexerTokenType.LT;
    else if (p === '>=') return LexerTokenType.GE;
    else if (p === '<=') return LexerTokenType.LE;
}

function operazion(p) {
    if (p === '+') return LexerTokenType.PLUS;
    else if (p === '-') return LexerTokenType.MINUS;
    else if (p === '*') return LexerTokenType.MULTIPLY;
    else if (p === '/') return LexerTokenType.DIVIDE;
}

module.exports.Lex = function (tokens) {
    let lTokStream = [];
    for (let i = 0; i < tokens.length; i++) {
        let cur = tokens[i];
        if (cur.type === TokenType.PRIM) lTokStream.push(new Token(primitiv(cur.content), cur.content));
        else if (cur.type === TokenType.NUMB) lTokStream.push(new Token(nummer(cur.content), cur.content));
        else if (cur.type === TokenType.OPER) lTokStream.push(new Token(operazion(cur.content), cur.content));
        else if (cur.type === TokenType.COMP) lTokStream.push(new Token(comparizon(cur.content), cur.content));
    }
    return lTokStream;
};

const Num = require('./Num');

const AST = {
    PUSH: 0,
    STORE: 1,
    RECALL: 2,
    EXECUTE: 3, 
    LABEL: 4,
    GT: 5,
    GE: 6,
    LT: 7,
    LE: 8,
    PLUS: 9,
    MINUS: 10,
    DIVIDE: 11,
    MULTIPLY: 12,
}
Object.freeze(AST);

function parseNumberToNum(token) {
    return new Num(token.content);
}

function parseNumber(tokens) {
    if (tokens[0].type !== LexerTokenType.NUMBER) return;
    return {
        a: AST.PUSH,
        o: parseNumberToNum(tokens.shift())
    };
}

function parseFunc(tokens) {
    tokens.shift();
    let name;
    let statements = [];
    if (tokens[0] && tokens[0].type === LexerTokenType.IDENT) {
        name = tokens.shift().content;
    }
    else {
        throw new Error('Parser error: expected IDENT');
    }
    while (tokens.length > 0 && tokens[0].type !== LexerTokenType.RTN) {
        statements.push(parseStatement(tokens, false));
    }
    if (tokens.length === 0) throw new Error(`Expected rtn at the end of label ${name}`);
    else tokens.shift();
    return {
        a: AST.LABEL,
        label: name,
        s: statements
    }
}


function parseStore(tokens) {
    if (tokens[0].type !== LexerTokenType.STO) return;
    tokens.shift();
    if (tokens[0] && tokens[0].type === LexerTokenType.IDENT) {
        // Parse recall ident
        return {
            a: AST.STO,
            l: tokens.shift().content,
        }
    }
    else throw new Error('Parser error: expecting IDENT');
}

function parseRecall(tokens) {
    if (tokens[0].type !== LexerTokenType.RCL) return;
    tokens.shift();
    if (tokens[0] && tokens[0].type === LexerTokenType.IDENT) {
        // Parse recall ident
        return {
            a: AST.RECALL,
            l: tokens.shift().content,
        }
    }
    else throw new Error('Parser error: expecting IDENT');
}

function parsePlus(tokens) {
    if (tokens[0].type !== LexerTokenType.PLUS) return;
    tokens.shift();
    return {
        a: AST.PLUS,
    };
}

function parseMinus(tokens) {
    if (tokens[0].type !== LexerTokenType.MINUS) return;
    tokens.shift();
    return {
        a: AST.MINUS,
    };
}

function parseMultiply(tokens) {
    if (tokens[0].type !== LexerTokenType.MULTIPLY) return;
    tokens.shift();
    return {
        a: AST.MULTIPLY,
    };
}

function parseDivide(tokens) {
    if (tokens[0].type !== LexerTokenType.DIVIDE) return;
    tokens.shift();
    return {
        a: AST.DIVIDE,
    };
}

function parseGT(tokens) {
    if (tokens[0].type !== LexerTokenType.GT) return;
    tokens.shift();
    return {
        a: AST.GT,
    };
}

function parseGE(tokens) {
    if (tokens[0].type !== LexerTokenType.GE) return;
    tokens.shift();
    return {
        a: AST.GE,
    };
}

function parseLT(tokens) {
    if (tokens[0].type !== LexerTokenType.LT) return;
    tokens.shift();
    return {
        a: AST.LT,
    };
}

function parseLE(tokens) {
    if (tokens[0].type !== LexerTokenType.LE) return;
    tokens.shift();
    return {
        a: AST.LE,
    };
}

function parseExecute(tokens) {
    if (tokens[0].type !== LexerTokenType.XEQ) return;
    tokens.shift();
    if (tokens[0] && tokens[0].type === LexerTokenType.IDENT) {
        // Parse recall ident
        return {
            a: AST.EXECUTE,
            l: tokens.shift().content,
        }
    }
    else throw new Error('Parser error: expecting IDENT');
}

function parseStatement(tokens, funced) {
    if (funced === undefined) funced = false;
    if (i = parseRecall(tokens)) return i;
    else if (i = parseStore(tokens)) return i;
    else if (i = parseExecute(tokens)) return i;
    else if (i = parseNumber(tokens)) return i;
    else if (i = parsePlus(tokens)) return i;
    else if (i = parseMinus(tokens)) return i;
    else if (i = parseMultiply(tokens)) return i;
    else if (i = parseDivide(tokens)) return i;
    else if (i = parseGT(tokens)) return i;
    else if (i = parseGE(tokens)) return i;
    else if (i = parseLT(tokens)) return i;
    else if (i = parseLE(tokens)) return i;
    else if (tokens[0].type === LexerTokenType.LBL && !funced) return parseFunc(tokens);
    else if (tokens[0].type === LexerTokenType.LBL && funced) {
        throw new Error('Parser error: cannot declare a label inside a label');
    }
    else {
        throw new Error(`Parser error: unexpected token ${tokens[0].content}`);
    }
}

function parseBase(tokens) {
    let base = {
        s: [],
    };
    while (tokens.length > 0) {
        base.s.push(parseStatement(tokens));
    }
    console.log(JSON.stringify(base, undefined, 2));
    return base;
}

module.exports.Parse = function (tokens) {
    return parseBase(tokens);
};