const fs = require("fs");
const vm = require("vm");

async function debugSeed() {
  const fileContents = fs.readFileSync("database_trains.md", "utf8");
  const cleanContents = fileContents.replace(/"PATNA""MANGALORE"/g, '"PATNA", destination: "MANGALORE"');
  
  const regex = /db\.trains\.insert\(([\s\S]+?)\);/g;
  let match;
  let index = 0;

  while ((match = regex.exec(cleanContents)) !== null) {
    index++;
    let objStr = match[1];
    try {
      const context = { ObjectId: (id) => id };
      vm.createContext(context);
      const trainData = vm.runInContext('(' + objStr + ')', context);
      console.log(`Match ${index}: Success`);
    } catch (e) {
      console.log(`Match ${index}: ERROR - ${e.message}`);
      // console.log(`Offending content: ${objStr.substring(0, 100)}...`);
    }
  }
}

debugSeed();
