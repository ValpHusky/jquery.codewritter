jqcWritterLangRules.javascript = {
    linecontrol: /\n|\s|\t|\r/,
    commentline: /\/\/(.*)(\n|\r)/i,
    commentblock:/\/\*(.*)\*\//i,
    arithmeticOperator: /\+|\-|\*|[0-9](.\/)[0-9]|\^|\%|\=/,
    discreteOperator: /\&\&|\|\||\!|\<|\<\=|\>|\>\=|\=\=\=|\=\=/,
    punctuation: /\.|\,|\:|\;|\(|\)|\{|\}|\[|\]/,
    reservedWord: /this|var|function|if|else|null/i,
    specialWord: /document|window/i,
    regex: /\/(.*)(\/a-z)/,
    string: /(^\"|\"$)|(^\'|\'$)/i,
    number: /[0-9]/i,
    boolean: /true|false/i,
    capsulingRules: {
        regex: [{
            open: [/\//,/[^\/]/],
            close: [/\//]
        }],
        commentline: [{
            open: [/\//,/\//],
            close: [/\r|\n/]
        }],
        commentblock: [{
            open: [/\//, /\/*/],
            close: [/\*/, /\//]
        }],
        string: [
            {
                open: [/\"/],
                close: [/\"/]
            },
            {
                open: [/\'/],
                close: [/\'/]
            }
        ]
    }
};
