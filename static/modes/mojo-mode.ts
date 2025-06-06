// Copyright (c) 2025, Compiler Explorer Authors
// All rights reserved.
//
// Redistribution and use in source and binary forms, with or without
// modification, are permitted provided that the following conditions are met:
//
//     * Redistributions of source code must retain the above copyright notice,
//       this list of conditions and the following disclaimer.
//     * Redistributions in binary form must reproduce the above copyright
//       notice, this list of conditions and the following disclaimer in the
//       documentation and/or other materials provided with the distribution.
//
// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
// AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
// IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
// ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE
// LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
// CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
// SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
// INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
// CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
// ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
// POSSIBILITY OF SUCH DAMAGE.

import * as monaco from 'monaco-editor';

function definition(): monaco.languages.IMonarchLanguage {
    return {
        // Set defaultToken to invalid to see what you do not tokenize yet
        defaultToken: 'invalid',

        // C# style strings
        escapes: /\\(?:[abfnrtv\\"']|x[0-9A-Fa-f]{1,4}|u[0-9A-Fa-f]{4}|U[0-9A-Fa-f]{8})/,

        registers: /%?\b(r[0-9]+[dbw]?|([er]?([abcd][xhl]|cs|fs|ds|ss|sp|bp|ip|sil?|dil?))|[xyz]mm[0-9]+|sp|fp|lr)\b/,

        intelOperators: /PTR|(D|Q|[XYZ]MM)?WORD/,

        tokenizer: {
            root: [
                // Error document
                [/^<.*>$/, {token: 'annotation'}],
                // inline comments
                [/\/\*/, 'comment', '@comment'],
                // Label definition (anything looking like a label, followed by anything that's not valid in a demangled
                // identifier, until we get to a colon followed by any whitespace. This is to avoid finding the colon in
                // a scoped (blah::foo) identifier.
                [/^[.a-zA-Z0-9_$?@][^#;/]*:(?=\s)/, {token: 'type.identifier'}],
                // Label definition (quoted)
                [/^"([^"\\]|\\.)*":/, {token: 'type.identifier'}],
                // Label definition (ARM style)
                [/^\s*[|][^|]*[|]/, {token: 'type.identifier'}],
                // Label definition (CL style). This is pretty hideous: we essentially take anything that ends in spaces
                // followed by a definition (PROC, ENDP etc) and assume it's a label. That means we have to use
                // backtracking and then a lookahead to ensure we don't consume the definition. As a nod to efficiency
                // we assume the line has to start with a non-whitespace character before we go all back-tracky.
                // See https://github.com/compiler-explorer/compiler-explorer/issues/1645 for examples.
                [/^\S.*?(?=\s+(PROC|ENDP|D[BDWQ]))/, {token: 'type.identifier', next: '@rest'}],
                // Constant definition
                [/^[.a-zA-Z0-9_$?@][^=]*=/, {token: 'type.identifier'}],
                // opcode
                [/[.a-zA-Z_][.a-zA-Z_0-9]*/, {token: 'keyword', next: '@rest'}],
                // braces and parentheses at the start of the line (e.g. nvcc output)
                [/[(){}]/, {token: 'operator', next: '@rest'}],
                // msvc can have strings at the start of a line in a inSegDirList
                [/`/, {token: 'string.backtick', bracket: '@open', next: '@segDirMsvcstring'}],

                // whitespace
                {include: '@whitespace'},
            ],

            rest: [
                // pop at the beginning of the next line and rematch
                [/^.*$/, {token: '@rematch', next: '@pop'}],

                [/@registers/, 'variable.predefined'],
                [/@intelOperators/, 'annotation'],
                // inline comments
                [/\/\*/, 'comment', '@comment'],
                // CL style post-label definition.
                [/PROC|ENDP|D[BDWQ]/, 'keyword'],

                // brackets
                [/[{}<>()[\]]/, '@brackets'],

                // ARM-style label reference
                [/[|][^|]*[|]*/, 'type.identifier'],

                // numbers
                [/\d*\.\d+([eE][-+]?\d+)?/, 'number.float'],
                [/([$]|0[xX])[0-9a-fA-F]+/, 'number.hex'],
                [/\d+/, 'number'],
                // ARM-style immediate numbers (which otherwise look like comments)
                [/#-?\d+/, 'number'],

                // operators
                [/[-+,*/!:&{}()]/, 'operator'],

                // strings
                [/"([^"\\]|\\.)*$/, 'string.invalid'], // non-terminated string
                [/"/, {token: 'string.quote', bracket: '@open', next: '@string'}],
                // `msvc does this, sometimes'
                [/`/, {token: 'string.backtick', bracket: '@open', next: '@msvcstring'}],
                [/'/, {token: 'string.singlequote', bracket: '@open', next: '@sstring'}],

                // characters
                [/'[^\\']'/, 'string'],
                [/(')(@escapes)(')/, ['string', 'string.escape', 'string']],
                [/'/, 'string.invalid'],

                // Assume anything else is a label reference. .NET uses ` in some identifiers
                [/%?[.?_$a-zA-Z@][.?_$a-zA-Z0-9@`]*/, 'type.identifier'],

                // whitespace
                {include: '@whitespace'},
            ],

            comment: [
                [/[^/*]+/, 'comment'],
                [/\/\*/, 'comment', '@push'], // nested comment
                ['\\*/', 'comment', '@pop'],
                [/[/*]/, 'comment'],
            ],

            string: [
                [/[^\\"]+/, 'string'],
                [/@escapes/, 'string.escape'],
                [/\\./, 'string.escape.invalid'],
                [/"/, {token: 'string.quote', bracket: '@close', next: '@pop'}],
            ],

            msvcstringCommon: [
                [/[^\\']+/, 'string'],
                [/@escapes/, 'string.escape'],
                [/''/, 'string.escape'], // ` isn't escaped but ' is escaped as ''
                [/\\./, 'string.escape.invalid'],
            ],

            msvcstring: [
                {include: '@msvcstringCommon'},
                [/'/, {token: 'string.backtick', bracket: '@close', next: '@pop'}],
            ],

            segDirMsvcstring: [
                {include: '@msvcstringCommon'},
                [/'/, {token: 'string.backtick', bracket: '@close', switchTo: '@rest'}],
            ],

            sstring: [
                [/[^\\']+/, 'string'],
                [/@escapes/, 'string.escape'],
                [/\\./, 'string.escape.invalid'],
                [/'/, {token: 'string.singlequote', bracket: '@close', next: '@pop'}],
            ],

            whitespace: [
                [/[ \t\r\n]+/, 'white'],
                [/\/\*/, 'comment', '@comment'],
                [/\/\/.*$/, 'comment'],
                [/[#;\\@].*$/, 'comment'],
            ],
        },
    };
}

const def = definition();
monaco.languages.register({id: 'mojo'});
monaco.languages.setMonarchTokensProvider('mojo', def);

export default def;
