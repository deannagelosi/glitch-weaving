class Drawdown {
    constructor(_wefts, _warps) {
      this.wefts = _wefts;
      this.warps = _warps;
      this.drawdown = [];
      
      this.patternName;
      this.numShafts; 
      this.shafts = [];
      this.threadingBase = [];
      this.glitchSectionSize;
      
      this.rowDataTemplate = {
        positions: null,
        originalPositions: null,
        glitched: null // true or false
      };
      
      this.init();
    }
    
    init() {
      // intitial blank drawdown
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
            this.threadingBase = structure.threadingBase;
            this.glitchSectionSize = structure.glitchSectionSize;
          }   
      }
    }
    
  //   RowData[] createThreading(int[] threadingBase, int targetSize, int numShafts) {
  //   int[] fullThread = fillArray(threadingBase, targetSize); // [1,2,3,4,1,2,3,4, etc...]
  
  //   // index the position data for all the warp shaft connections
  //   int[][] positions = new int[numShafts][0];
  
  //   for (int i = 0; i < fullThread.length; i++) {
  //     int currKey = fullThread[i];
  
  //     if (positions[currKey - 1].length == 0) {
  //       // not seen this key yet, add it
  //       positions[currKey - 1] = new int[]{i + 1};
  //     } else {
  //       // update existing key
  //       positions[currKey-1] = append(positions[currKey-1], i + 1);
  //     }
  //   }
  
  //   RowData[] threading = new RowData[numShafts];
  
  //   for (int i = 0; i < threading.length; i++) {  
  //     RowData threadRow = new RowData(positions[i]);
  //     threading[i] = threadRow;
  //   }
  
  //   return threading;
  // }
    
    // threadingBase = this.threadingBase
    // targetSize = this.warps
    // numShafts = this.numShafts
    createThreading() {
      let threading = this.fillArray(); // expands the threading base across the warps
      // populate positions based on number of shafts
      sst 
    }
  }