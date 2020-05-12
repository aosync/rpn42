const Parser = require('./lib/Parser');

let tokS = Parser.Tokenize('lbl test 4 + + + lbl hey +> rtn rtn xeq lol');
let lTokS = Parser.Lex(tokS);
Parser.Parse(lTokS);