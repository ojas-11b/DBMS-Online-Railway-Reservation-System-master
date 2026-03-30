const mongoose = require("mongoose");
const fs = require("fs");
const vm = require("vm");
const Seats = require("./models/seats");
const Train = require("./models/train");
const User = require("./models/user");

mongoose.connect("mongodb://localhost/railway_reservation", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

async function seedData() {
  console.log("Emptying database...");
  await Seats.deleteMany({});
  await Train.deleteMany({});
  console.log("Deleted existing seats and trains.");

  const fileContents = fs.readFileSync("database_trains.md", "utf8");
  
  // Need to fix a known typo in the file where a comma is missing
  const cleanContents = fileContents.replace(/"PATNA""MANGALORE"/g, '"PATNA", destination: "MANGALORE"');
  
  const regex = /db\.trains\.insert\(([\s\S]+?)\);/g;
  let match;
  let successCount = 0;
  let failCount = 0;

  while ((match = regex.exec(cleanContents)) !== null) {
    try {
      let objStr = match[1];
      
      // We process the unquoted JS object using a VM context
      const context = { ObjectId: (id) => id };
      vm.createContext(context);
      
      // Try to parse the object safely
      const trainData = vm.runInContext('(' + objStr + ')', context);
      
      if (trainData && trainData.no_of_seats) {
        // Create new seat record
        const newSeat = await Seats.create(trainData.no_of_seats);
        
        // Ensure destination field is fixed in case regex replace missed something
        trainData.seats_status = [newSeat._id];
        
        await Train.create(trainData);
        successCount++;
      }
    } catch (e) {
      failCount++;
      console.error(`Error importing record ${successCount + failCount}:`, e.message);
      // Silently skip malformed ones in the md file
    }
  }

  console.log(`Finished!\nSuccessfully imported ${successCount} trains from sample data.`);
  if (failCount > 0) {
    console.log(`Skipped ${failCount} malformed records.`);
  }
  
  mongoose.connection.close();
}

seedData().catch(err => {
  console.error("Fatal Error:", err);
  mongoose.connection.close();
});
