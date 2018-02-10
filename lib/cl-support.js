// Copyright (c) 2012-2018, Patrick Quist
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

"use strict";

const fs = require('fs-extra'),
    path = require('path'),
    _ = require('underscore-node'),
    utils = require('./utils'),
    exec = require('./exec'),
    Demangler = require("./demangler-cpp").Demangler;

class DemanglerCL extends Demangler {
    constructor(demanglerExe, symbolstore, compiler) {
        super(demanglerExe, symbolstore);

        this.compiler = compiler;
        this.labelDef = /^([.a-z_$\?][a-z0-9$@\?_]*)\s?(.*)?:/i;
    }

    ExecDemangler(options) {
        return this.compiler.newTempDir().then((tmpDir) => {
            var tmpfile = path.join(tmpDir, "output.s");
            fs.writeFileSync(tmpfile, options.input);
            options.input = "";

            var tmpFileAsArgument = this.compiler.filename(tmpfile);
            return exec.execute(
                this.demanglerExe,
                [tmpFileAsArgument],
                options
            ).then((demangleResult) => {
                fs.unlink(tmpfile, () => {
                    fs.remove(tmpDir, () => {});
                });

                return demangleResult;
            });
        });
    }
};

function RunCLDemangler(compiler, result) {
    if (!result.okToCache) return result;
    let demanglerExe = compiler.compiler.demangler;
    if (!demanglerExe) return result;

    let demangler = null;
    if (demanglerExe.toLowerCase().endsWith("undname.exe")) {
        demangler = new DemanglerCL(demanglerExe, null, compiler);
    } else {
        demangler = new Demangler(demanglerExe);
    }

    return demangler.Process(result, compiler.getDefaultExecOptions());
}

exports.RunCLDemangler = RunCLDemangler;
