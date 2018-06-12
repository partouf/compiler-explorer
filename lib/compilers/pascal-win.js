// Copyright (c) 2017, Patrick Quist
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

const
    BaseCompiler = require('../base-compiler'),
    path = require('path'),
    utils = require('../utils'),
    fs = require('fs'),
    logger = require('../logger').logger,
    PascalLabelReconstructor = require('../pe32-support').labelReconstructor;

class PascalWin extends BaseCompiler {
    constructor(info, env) {
        super(info, env);
        info.supportsFiltersInBinary = true;

        this.mapFilename = false;
        this.compileFilename = 'output.pas';
    }

    exec(command, args, options) {
        if (process.platform === "linux" || process.platform === "darwin") {
            const wine = env.gccProps("wine");

            args = args.slice(0);
            if (command.toLowerCase().endsWith(".exe")) {
                args.unshift(command);
                command = wine;
            }
        }

        return super.exec(command, args, options);
    }

    getOutputFilename(dirPath) {
        return path.join(dirPath, "prog.exe");
    }

    filename(fn) {
        if (process.platform === "linux" || process.platform === "darwin") {
            return 'Z:' + fn;
        } else {
            return super.filename(fn);
        }
    }

    objdump(outputFilename, result, maxSize, intelAsm, demangle) {
        outputFilename = this.getOutputFilename(path.dirname(outputFilename));

        let args = ["-d", outputFilename];
        if (intelAsm) args = args.concat(["-M", "intel"]);
        return this.exec(this.compiler.objdumper, args, {maxOutput: 1024 * 1024 * 1024})
           .then((objResult) => {
               if (objResult.code !== 0) {
                   result.asm = "<No output: objdump returned " + objResult.code + ">";
               } else {
                   result.asm = objResult.stdout;
               }

               return result;
           });
    }

    saveDummyProjectFile(dprfile, sourcefile) {
        if (dprfile.startsWith("Z:")) {
            dprfile = dprfile.substr(2);
        }

        fs.writeFileSync(dprfile,
            "program prog; " +
            "uses output in '" + sourcefile + "'; " +
            "begin " +
            "end.");
    }

    runCompiler(compiler, options, inputFilename, execOptions) {
        if (!execOptions) {
            execOptions = this.getDefaultExecOptions();
        }

        const tempPath = path.dirname(inputFilename);
        const projectFile = path.join(tempPath, "prog.dpr");

        this.mapFilename = path.join(tempPath, "prog.map");

        inputFilename = inputFilename.replace(/\//g, '\\');
        this.saveDummyProjectFile(projectFile, inputFilename);

        options.pop();
        options.push('-CC');
        options.push('-W');
        options.push('-H');
        options.push('-GD');
        options.push('-$D+');
        options.push('-V');
        options.push('-B');
        options.push(projectFile.replace(/\//g, '\\'));

        return this.exec(compiler, options, execOptions).then((result) => {
            result.inputFilename = inputFilename;
            result.stdout = utils.parseOutput(result.stdout, inputFilename);
            result.stderr = utils.parseOutput(result.stderr, inputFilename);
            return result;
        });
    }

    optionsForFilter(filters, outputFilename, userOptions) {
        filters.binary = true;
        filters.preProcessBinaryAsmLines = (asmLines) => {
            const reconstructor = new PascalLabelReconstructor(asmLines, this.mapFilename, false);
            reconstructor.run("output");
    
            return reconstructor.asmLines;
        };

        return [];
    };
}

module.exports = PascalWin;
