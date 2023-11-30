class Drawdown {
    constructor(_wefts, _warps) {
        this.wefts = _wefts;
        this.warps = _warps;

        this.patternName;
        this.numShafts;
        this.shafts = [];
        this.threading = [];
        this.glitchSectionSize;

        this.rowDataTemplate = {
            positions: null,
            originalPositions: null,
            glitched: null // true or false
        };
        this.drawdownData = []; // array of rowDataTemplate objects
        this.threadingData = []; // array of rowDataTemplate objects
        this.tieupData = []; // array of rowDataTemplate objects
        this.liftPlanData = []; // array of rowDataTemplate objects
    }

    loadPattern(_patternName) {
        if (jsonData) {
            let structure = this.findInObject(jsonData, struct => struct.name === _patternName);
            if (structure) {
                this.patternName = structure.name;
                this.numShafts = structure.numShafts;
                this.shafts = structure.shafts;
                this.threading = this.fillArray(structure.threadingBase); // expands the threading base across the warps;
                this.glitchSectionSize = structure.glitchSectionSize;
            }
        }
    }

    createThreading() {
        // populate positions based on number of shafts
        let positions = [];
        for (let i = 0; i < this.numShafts; i++) {
            positions[i] = [];
        }
        // populate positions with threading data
        for (let i = 0; i < this.warps; i++) {
            let currKey = this.threading[i];
            if (positions[currKey - 1].length == 0) {
                // not seen this key yet, add it
                positions[currKey - 1] = [i + 1];
            } else {
                // update existing key
                positions[currKey - 1].push(i + 1);
            }
        }

        // position data saved into threadingData array
        this.threadingData = [];
        for (let i = 0; i < this.numShafts; i++) {
            this.threadingData[i] = { ...this.rowDataTemplate };
            this.threadingData[i].positions = positions[i];
            this.threadingData[i].originalPositions = positions[i];
            this.threadingData[i].glitched = false;
        }
    }

    createTieup() {
        for (let i = 0; i < this.numShafts; i++) {
            let shaft = [i + 1];
            this.tieupData[i] = { ...this.rowDataTemplate };
            this.tieupData[i].positions = shaft;
            this.tieupData[i].originalPositions = shaft;
            this.tieupData[i].glitched = false;
        }
    }

    createLiftPlan() {
        for (let i = 0; i < this.wefts; i = i + this.shafts.length) {
            for (let j = 0; j < this.shafts.length; j++) {
                if (this.liftPlanData.length <= this.wefts) {
                    // append the next row
                    let importedRow = this.shafts[j];
                    let newRow = { ...this.rowDataTemplate };
                    newRow.positions = importedRow;
                    newRow.originalPositions = importedRow;
                    newRow.glitched = false;
                    this.liftPlanData.push(newRow);
                } else {
                    break;
                }
            }
        }
    }

    glitchLiftPlan() {
        let currRow = 0;
        let currSection = 0;
        for (let i = 0; i < this.liftPlanData.length; i += this.glitchSectionSize) {
            let sliceSize;
            if (this.liftPlanData.length - currRow > this.glitchSectionSize) {
                sliceSize = this.glitchSectionSize;
            } else {
                sliceSize = this.liftPlanData.length - currRow;
            }

            // Take a slice of the lift plan
            let slice = this.liftPlanData.slice(i, i + sliceSize);

            // Perform the glitch operation (assuming gradientGlitch is defined)
            let glitchSection = this.gradientGlitch(slice, currSection, currRow);
            for (let j = 0; j < glitchSection.length; j++) {
                if (currRow < this.liftPlanData.length) {
                    this.liftPlanData[currRow] = glitchSection[j];
                    currRow++;
                }
            }
            currSection++;
        }
    }

    gradientGlitch(liftPlanSegment, currSection, currRow) {
        // set number of changes based on current section and glitchMod
        let numChanges = currSection === 0 ? 0 : currSection + this.glitchMod; // to do: controls or global?

        // make a copy of the lift plan slice to modify without affecting the original
        let modLiftPlan = this.copyRowDataArray(liftPlanSegment);

        // loop the number of changes
        let px = 0; // left-most point on the rectangle
        for (let i = 0; i < numChanges; i++) {
            if (modLiftPlan.length > 1) {
                // select row and shaft
                let py = currRow * cellSize;
                let selectedRow = this.perlinChoose(modLiftPlan.length, px, py);
                py = (currRow + selectedRow) * cellSize;
                let selectedShaft = this.perlinChoose(modLiftPlan[selectedRow].positions.length, px, py);

                // apply glitch
                let whichGlitch = this.perlinChoose(3, px, py);
                // Glitch 0: Add a shaft, Glitch 1: Remove a shaft, Glitch 2: Swap a shaft
                if (whichGlitch === 0) {
                    // add a shaft
                    if (modLiftPlan[selectedRow].positions.length < this.numShafts - 1) {
                        let newShaft = this.perlinChoose(this.numShafts, px, py) + 1;
                        if (!modLiftPlan[selectedRow].positions.includes(newShaft)) {
                            modLiftPlan[selectedRow].positions.push(newShaft);
                        } else {
                            whichGlitch = this.perlinChoose(2, px, py) + 1;
                        }
                    } else {
                        whichGlitch = this.perlinChoose(2, px, py) + 1;
                    }
                }
                if (whichGlitch === 1) {
                    // remove a shaft
                    if (modLiftPlan[selectedRow].positions.length > 1) {
                        modLiftPlan[selectedRow].positions.splice(selectedShaft, 1);
                    } else {
                        // deleting the last shaft will leave none, choose a new shaft instead
                        whichGlitch = 2;
                    }
                }
                if (whichGlitch === 2) {
                    // switch a shaft
                    modLiftPlan[selectedRow].positions = this.switchShaft(modLiftPlan[selectedRow].positions, px, py);
                }

                // mark if the row has been glitched
                modLiftPlan[selectedRow].glitched = !this.arraysEqual(modLiftPlan[selectedRow].positions, modLiftPlan[selectedRow].originalPositions);

                // change sampling position in Perlin noise field
                px = px + cellSize;
            }
        }

        return modLiftPlan;
    }

    switchShaft(currentRow, px, py) {
        // Choose a shaft to delete
        let selectedShaftIndex = this.perlinChoose(currentRow.length, px, py);
        // Delete selected shaft from current row
        currentRow.splice(selectedShaftIndex, 1); // Removes the item at the selected index

        // Choose a new shaft
        let newShaft = this.perlinChoose(this.numShafts, px, py) + 1;
        // Add new shaft to current row
        currentRow.push(newShaft);

        return currentRow;
    }

    perlinChoose(numItems, px, py) {
        px = px + pan; // Add offset when panning

        // noise() in p5.js also returns a value between 0 and 1
        let trim = 0.3;
        let pNoise = noise(px / pZoom, py / pZoom); // 0..1

        // Adjust noise value within the trimmed range
        if (pNoise < trim) {
            pNoise = trim + 0.01;
        } else if (pNoise > (1 - trim)) {
            pNoise = 1 - trim - 0.01;
        }

        // Map the noise value to a number between 0 and numItems
        let selected = Math.floor(map(pNoise, trim, 1 - trim, 0, numItems));

        return selected;
    }

    createDrawdown() {
        // Create drawdown from liftPlanData and threadingData
        for (let i = 0; i < this.liftPlanData.length; i++) {
            let rowLiftedWarps = [];

            for (let j = 0; j < this.liftPlanData[i].positions.length; j++) {
                let shaft = this.liftPlanData[i].positions[j];
                rowLiftedWarps = rowLiftedWarps.concat(this.threadingData[shaft - 1].positions);
            }

            // Create a new rowData object for drawdown
            this.drawdownData[i] = { ...this.rowDataTemplate };
            this.drawdownData[i].positions = rowLiftedWarps;
            if (this.liftPlanData[i].glitched) {
                this.drawdownData[i].glitched = true;
            }
        }
    }

    // Display methods
    printDraft() {
        background(100); // Dark grey

        // calc padding and dimensions
        let padding = cellSize;
        let liftPlanWidth = this.numShafts * cellSize;
        let threadingHeight = this.numShafts * cellSize;

        // Print sections
        this.printSection("tieup", liftPlanWidth + padding, threadingHeight);
        this.printSection("threading", 3 * padding + liftPlanWidth, threadingHeight);
        this.printSection("liftplan", liftPlanWidth + padding, 2 * padding + threadingHeight);
        this.printSection("drawdown", 3 * padding + liftPlanWidth, 2 * padding + threadingHeight);

        if (showLines) {
            let numX = cellSize + 7;
            let numY = 7 * cellSize - 2;
            for (let i = this.wefts; i > 0; i--) {
                fill(i % 5 === 0 ? [255, 204, 255] : 255);
                text(i, numX, numY);
                numY += cellSize;
            }
        }
    }

    printSection(section, leftBuffer, topBuffer) {
        let sectionData;
        let numCols;
        switch (section) {
            case "tieup":
                sectionData = this.tieupData;
                numCols = this.numShafts;
                break;
            case "threading":
                sectionData = this.threadingData;
                numCols = this.warps;
                break;
            case "liftplan":
                sectionData = this.liftPlanData;
                numCols = this.numShafts;
                break;
            case "drawdown":
                sectionData = this.drawdownData;
                numCols = this.warps;
                break;
            default:
                console.log("Error finding section data");
        }

        // Display section grids
        for (let row = 0; row < sectionData.length; row++) {
            for (let col = 0; col < numCols; col++) {
                let warpLifted = sectionData[row].positions.includes(col + 1);
                let weftGlitched = sectionData[row].glitched;

                if (warpLifted && weftGlitched) {
                    fill(255, 51, 153); // Pink cell
                } else if (!warpLifted && weftGlitched) {
                    fill(255, 204, 255); // Light pink cell
                } else if (warpLifted) {
                    fill(0); // Black cell
                } else {
                    fill(255); // White cell
                }

                // Determine the pixel position
                let pixelX = 0
                let pixelY = 0;
                switch (section) {
                    case "tieup":
                        // bottom-right
                        pixelX = leftBuffer - (col * cellSize);
                        pixelY = topBuffer - (row * cellSize);
                        break;
                    case "threading":
                        // bottom-left
                        pixelX = leftBuffer + (col * cellSize);
                        pixelY = topBuffer - (row * cellSize);
                        break;
                    case "liftplan":
                        // top-right
                        pixelX = leftBuffer - (col * cellSize);
                        pixelY = topBuffer + (row * cellSize);
                        break;
                    case "drawdown":
                        // top-left
                        pixelX = leftBuffer + (col * cellSize);
                        pixelY = topBuffer + (row * cellSize);
                        break;
                }

                rect(pixelX, pixelY, cellSize, cellSize);
            }
        }
    }

    // helpers
    findInObject(obj, searchFn) {
        for (let key in obj) {
            if (obj.hasOwnProperty(key) && searchFn(obj[key])) {
                return obj[key];
            }
        }
        return null;
    }

    fillArray(array) {
        let filledArray = [];
        let loopQuant = Math.ceil(this.warps / array.length);

        for (let i = 0; i < loopQuant; i++) {
            for (let j = 0; j < array.length; j++) {
                if (filledArray.length === this.warps) {
                    break;
                } else {
                    filledArray.push(array[j]);
                }
            }
        }

        return filledArray;
    }

    copyRowDataArray(rowDataArray) {
        return rowDataArray.map(rowData => {
            return {
                positions: [...rowData.positions], // Copy of positions array
                originalPositions: [...rowData.originalPositions], // Copy of originalPositions array
                glitched: rowData.glitched
            };
        });
    }

    arraysEqual(arr1, arr2) {
        return JSON.stringify(arr1) === JSON.stringify(arr2);
    }
}