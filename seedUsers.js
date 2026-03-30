const mongoose = require("mongoose");
const User = require("./models/user");

const url = process.env.DATABASEURL || "mongodb://localhost/railway_reservation";

async function seedData() {
  try {
    await mongoose.connect(url, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify: false
    });
    console.log("Connected to MongoDB for Seeding...");

    console.log("Deleting existing users...");
    await User.deleteMany({});
    
    console.log("Starting to seed 500 users. This might take a moment due to password hashing...");
    
    let count = 0;
    
    for (let i = 1; i <= 500; i++) {
      const username = `passenger_${i}_${Math.floor(Math.random() * 10000)}`;
      const password = `pass@${i}`;
      
      const newUser = new User({ username: username });
      
      await new Promise((resolve, reject) => {
        User.register(newUser, password, (err, user) => {
          if (err) {
            console.error("Error creating user:", username, err);
            reject(err);
          } else {
            count++;
            if (count % 50 === 0) {
              console.log(`${count} users seeded successfully...`);
            }
            resolve(user);
          }
        });
      });
    }

    console.log(`\nSuccess! Seeded ${count} total users into the database.`);
  } catch (error) {
    console.error("Fatal Error during DB operations: ", error);
  } finally {
    console.log("Closing connection...");
    mongoose.connection.close();
  }
}

seedData();
