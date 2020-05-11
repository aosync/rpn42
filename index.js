const Token = require('./lib/Token');

let tokS = Token.Tokenize('lbl ho lbl test 1 1 + rtn rtn');
let lTokS = Token.Lex(tokS);
Token.Parse(lTokS);