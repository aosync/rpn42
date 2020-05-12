const Token = require('./lib/Token');

let tokS = Token.Tokenize('lbl test lbl ha 4 4 + rtn + rtn >');
let lTokS = Token.Lex(tokS);
Token.Parse(lTokS);