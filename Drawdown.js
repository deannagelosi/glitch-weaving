class Drawdown {
    constructor(_wefts, _warps) {
      this.wefts = _wefts;
      this.warps = _warps;
      this.drawdown = [];
      
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
      this.threadingData = []; // array of rowDataTemplate objects
      
      this.init();
    }
    
    init() {
      // initial blank drawdown
      for (let i = 0; i < this.wefts; i++) {
        this.drawdown[i] = [];
        for (let j = 0; j < this.warps; j++) {
          this.drawdown[i][j] = false;
        }
      }
    }
    
    display() {
      for (let i = 0; i < this.wefts; i++) {
        for (let j = 0; j < this.warps; j++) {
          if (this.drawdown[i][j]) {
            fill(0);
          } else {
            fill(255);
          }
          rect(j * cellSize, i * cellSize, cellSize, cellSize);
        }
      }    
    }
    
    findInObject(obj, searchFn) {
      for (let key in obj) {
        if (obj.hasOwnProperty(key) && searchFn(obj[key])) {
          return obj[key];
        }
      }
      return null;
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
      console.log(positions);
      // populate positions with threading data
      for (let i = 0; i < this.warps; i++) {
        let currKey = this.threading[i];
        if (positions[currKey - 1].length == 0) {
          // not seen this key yet, add it
          positions[currKey - 1] = [i + 1];
        } else {
          // update existing key
          positions[currKey-1].push(i + 1);
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
      
  }