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

const AST = {
    PUSH: 0,
    STORE: 1,
    RECALL: 2,
    EXECUTE: 3,
    COMMIT: 4,
    COMPARE: 5,
    LABEL: 6
}

function parseFunc(tokens) {
    tokens.shift();
    let name;
    let statements = [];
    if (tokens[0].type === LexerTokenType.IDENT) {
        name = tokens.shift();
    }
    else {
        throw new Error('Parser error: expected IDENT');
    }
    while (tokens.length > 0 && tokens[0].type !== LexerTokenType.RTN) {
        statements.push(parseStatement(tokens, false));
    }
    if (tokens.length === 0) throw new Error(`Expected rtn at the end of label ${name.content}`);
    else tokens.shift();
    return {
        a: AST.LABEL,
        label: name,
        statements: statements
    }
}

function parseRecall(tokens) {
    if (tokens[0].type === LexerTokenType.IDENT) {
        // Parse recall ident
        return tokens.shift();
    }
    else throw new Error('Parser error: expecting IDENT');
}

function parseStore(tokens) {
    if (tokens[0].type === LexerTokenType.IDENT) {
        // Parse store ident
        return tokens.shift();
    }
    else throw new Error('Parser error: expecting IDENT');
}

function parseStatement(tokens, funced) {
    if (funced === undefined) funced === false;
    if (tokens[0].type === LexerTokenType.RCL) {
        // Parse recall
        tokens.shift();
        return {
            a: AST.RECALL,
            what: parseRecall(tokens),
        }
    }
    else if (tokens[0].type === LexerTokenType.STO) {
        // Parse store
        tokens.shift();
        return {
            a: AST.STORE,
            where: parseStore(tokens),
        }
    }
    else if (tokens[0].type === LexerTokenType.NUMBER) {
        // Parse store
        return {
            a: AST.PUSH,
            what: tokens.shift(),
        }
    }
    else if (tokens[0].type === LexerTokenType.PLUS || tokens[0].type === LexerTokenType.MINUS || tokens[0].type === LexerTokenType.MULTIPLY || tokens[0].type === LexerTokenType.DIVIDE) {
        // Parse store
        return {
            a: AST.COMMIT,
            how: tokens.shift(),
        }
    }
    else if (tokens[0].type === LexerTokenType.GT || tokens[0].type === LexerTokenType.GE || tokens[0].type === LexerTokenType.LT || tokens[0].type === LexerTokenType.LE) {
        // Parse store
        return {
            a: AST.COMPARE,
            how: tokens.shift(),
        }
    }
    else if (tokens[0].type === LexerTokenType.LBL && !funced) {
        // Parse store
        return parseFunc(tokens);
    }
    else if (tokens[0].type === LexerTokenType.LBL && funced) {
        throw new Error('Parser error: cannot declare a label inside a label');
    }
    else {
        throw new Error(`Parser error: unexpected token ${tokens[0].content}`);
    }
}

function parseBase(tokens) {
    let base = {
        statements: [],
    };
    while (tokens.length > 0) {
        base.statements.push(parseStatement(tokens));
    }
    console.log(JSON.stringify(base, undefined, 2));
    return base;
}

module.exports.Parse = function (tokens) {
    return parseBase(tokens);
};