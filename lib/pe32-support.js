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
"use strict";

var MapFileReader = require('./map-file').MapFileReader,
    logger = require('./logger').logger;

class PELabelReconstructor {
    /**
     * 
     * @param {Array} asmLines 
     * @param {string} mapFilename 
     * @param {boolean} dontLabelUnmappedAddresses 
     * @param {function} callback 
     */
    constructor(asmLines, mapFilename, dontLabelUnmappedAddresses) {
        this.asmLines = asmLines;
        this.addressesToLabel = [];
        this.dontLabelUnmappedAddresses = dontLabelUnmappedAddresses;

        this.addressRegex = /^\s*([0-9a-z]*):/i;
        this.mapFileReader = null;
        this.mapFilename = mapFilename;
    }

    run() {
        this.mapFileReader = new MapFileReader(this.mapFilename);
        this.mapFileReader.run();

        this.deleteEverythingBut("output");
    
        this.collectJumpsAndCalls();
        this.insertLabels();
    }

    deleteEverythingBut(unitName) {
        var idx, info;
        for (idx = 0; idx < this.mapFileReader.segments.length; idx++) {
            info = this.mapFileReader.segments[idx];
            if (info.unitName !== unitName) {
                this.deleteLinesBetweenAddresses(info.addressInt, info.addressInt + info.segmentLength);
            }
        }

        for (idx = 0; idx < this.mapFileReader.isegments.length; idx++) {
            info = this.mapFileReader.isegments[idx];
            if (info.unitName !== unitName) {
                this.deleteLinesBetweenAddresses(info.addressInt, info.addressInt + info.segmentLength);
            }
        }
    }

    /**
     * 
     * @param {number} beginAddress 
     * @param {number} endAddress 
     */
    deleteLinesBetweenAddresses(beginAddress, endAddress) {
        let startIdx = -1;
        let linesRemoved = false;
        let lineIdx = 0;

        while (lineIdx < this.asmLines.length) {
            const line = this.asmLines[lineIdx];

            const matches = line.match(this.addressRegex);
            if (matches) {
                const lineAddr = parseInt(matches[1], 16);
                if ((startIdx === -1) && (lineAddr >= beginAddress)) {
                    startIdx = lineIdx;
                    if (line.endsWith("<CODE>:") || line.endsWith("<.text>:") || line.endsWith("<.itext>:")) {
                        startIdx++;
                    }
                } else if (lineAddr >= endAddress) {
                    this.asmLines.splice(startIdx, lineIdx - startIdx - 1);
                    linesRemoved = true;
                    break;
                }
            }

            lineIdx++;
        }

        if (!linesRemoved) {
            this.asmLines.splice(startIdx, this.asmLines.length - startIdx);
        }
    }

    collectJumpsAndCalls() {
        var jumpRegex = /(\sj[a-z]*)(\s*)0x([0-9a-f]*)/i;
        var callRegex = /(\scall)(\s*)0x([0-9a-f]*)/i;

        for (var lineIdx = 0; lineIdx < this.asmLines.length; lineIdx++) {
            var line = this.asmLines[lineIdx];

            var namedAddr = false;
            var labelName = false;
            var address = false;

            var matches = line.match(jumpRegex);
            if (matches) {
                address = matches[3];
                if (!address.includes('+') && !address.includes('-')) {
                    labelName = "L" + address;
                    namedAddr = this.mapFileReader.getSymbolAt(false, parseInt(address, 16));
                    if (namedAddr) {
                        labelName = namedAddr.displayName;
                    }

                    if (!this.dontLabelUnmappedAddresses || namedAddr) {
                        this.addressesToLabel.push(address);
                        this.asmLines[lineIdx] = line.replace(jumpRegex, " " + matches[1] + matches[2] + labelName);
                    }
                }
            }

            matches = line.match(callRegex);
            if (matches && !matches[3].includes('+') && !matches[3].includes('-')) {
                address = matches[3];
                if (!address.includes('+') && !address.includes('-')) {
                    labelName = "L" + address;
                    namedAddr = this.mapFileReader.getSymbolAt(false, parseInt(address, 16));
                    if (namedAddr) {
                        labelName = namedAddr.displayName;
                    }

                    if (!this.dontLabelUnmappedAddresses || namedAddr) {
                        this.addressesToLabel.push(address);
                        this.asmLines[lineIdx] = line.replace(callRegex, " " + matches[1] + matches[2] + labelName);
                    }
                }
            }
        }
    }

    insertLabels() {
        var sourceFileId = this.mapFileReader.getSegmentIdByUnitName("output");

        var currentSegment = false;
        var currentSymbol = false;

        var lineIdx = 0;
        while (lineIdx < this.asmLines.length) {
            var line = this.asmLines[lineIdx];

            var matches = line.match(this.addressRegex);
            if (matches) {
                var addressStr = matches[1];
                var address = parseInt(addressStr, 16);

                var segmentInfo = this.mapFileReader.getSegmentInfoByStartingAddress(false, address);
                if (segmentInfo) {
                    currentSegment = segmentInfo;
                }

                var namedAddr = false;
                var labelLine = false;

                var isReferenced = this.addressesToLabel.indexOf(addressStr);
                if (isReferenced !== -1) {
                    labelLine = matches[1] + " <L" + addressStr + ">:";

                    namedAddr = this.mapFileReader.getSymbolAt(false, address);
                    if (namedAddr) {
                        currentSymbol = namedAddr.displayName;
                        labelLine = matches[1] + " <" + namedAddr.displayName + ">:";
                    }
                    
                    if (!this.dontLabelUnmappedAddresses || namedAddr) {
                        this.asmLines.splice(lineIdx, 0, labelLine);
                        lineIdx++;
                    }
                } else {
                    // we might have missed the reference to this address, but if it's listed as a symbol, we should still label it
                    // todo: the call might be in <.itext>, should we include that part of the assembly?
                    namedAddr = this.mapFileReader.getSymbolAt(false, address);
                    if (namedAddr) {
                        currentSymbol = namedAddr.displayName;
                        labelLine = matches[1] + " <" + namedAddr.displayName + ">:";

                        this.asmLines.splice(lineIdx, 0, labelLine);
                        lineIdx++;
                    }
                }

                var lineInfo = this.mapFileReader.getLineInfoByAddress(false, address);
                if (lineInfo && currentSegment.unitName.startsWith("output")) {
                    this.asmLines.splice(lineIdx, 0, "/" + sourceFileId + ":" + lineInfo.lineNumber);
                    lineIdx++;
                }
            }
            
            lineIdx++;
        }
    }
}

exports.labelReconstructor = PELabelReconstructor;
