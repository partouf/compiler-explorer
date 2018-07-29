// Copyright (c) 2018, Compiler Explorer Team
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

class LookupHandler {
    constructor() {
        this.BeforeAfter = 3;
    }

    lookup(file, line) {
        let output = [];
        let lineNumber = 0;
        const startLine = line - this.BeforeAfter;
        const endLine = line + this.BeforeAfter;

        return new Promise(resolve => {
            const stream = fs.createReadStream(file, {encoding: "utf-8"})
            stream.on("data", (chunk) => {
                let len = chunk.length;
                for (let i = 0; i < len; ++i) {
                    if (chunk[i] == '\n') {
                        lineNumber++;
                        if (lineNumber > endline) break;
                    } else if (chunk[i] == '\r') {
                        // ignore
                    } else {
                        if ((lineNumber >= startLine) && (lineNumber <= endLine)) {
                            if (!output[lineNumber - startLine]) output[lineNumber - startLine] = "";
                            output[lineNumber - startLine] += chunk[i];
                        }
                    }
                }

                if (lineNumber > endline) {
                    stream.destroy();
                }
            });
            stream.on("end", () => {
                resolve(output);
            });
        });
    }

    handle(req, res) {
        const jsonRequest = JSON.parse(req.body);
        let lookupResult = false;

        if (jsonRequest.file && jsonRequest.line) {
            //if (jsonRequest.file.endsWith())

            lookupResult = this.lookup(jsonRequest.file, jsonRequest.line);
        }

        res.set('Content-Type', 'application/json');
        res.end(JSON.stringify(lookupResult));
    }
}

module.exports.Lookup = LookupHandler;
