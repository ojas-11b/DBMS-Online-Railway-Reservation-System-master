const mongoose = require("mongoose");
const Seats = require("./models/seats");
const Train = require("./models/train");
const User = require("./models/user");

mongoose.connect("mongodb://localhost/railway_reservation", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const defaultSeats = { one_A: 111, two_A: 111, three_A: 111, sleeper: 111 };

async function seedDB() {
  console.log("Emptying existing data...");
  await Seats.deleteMany({});
  await Train.deleteMany({});
  await User.deleteMany({});

  console.log("Creating seats...");
  const seats1 = await Seats.create(defaultSeats);
  const seats2 = await Seats.create({ one_A: 54, two_A: 24, three_A: 15, sleeper: 51 });
  const seats3 = await Seats.create({ one_A: 11, two_A: 11, three_A: 11, sleeper: 11 });

  console.log("Creating trains...");
  const trains = [
    {
      source: "PATNA",
      destination: "MANGALORE",
      train_details: [{ number: "1225", name: "RAJDGI EXPRESS", fare: 1713, travel_time: "31H:05min:10sec", start_time: "19:10" }],
      no_of_seats: defaultSeats,
      no_of_station: 91,
      distance: "989 Km",
      seats_status: [seats1._id]
    },
    {
      source: "MUMBAI",
      destination: "PATNA",
      train_details: [{ number: "45621", name: "Shatabdi Express", fare: 543, travel_time: "42H:30min:21sec", start_time: "15:00" }],
      no_of_seats: { one_A: 54, two_A: 24, three_A: 15, sleeper: 51 },
      no_of_station: 23,
      distance: "598 Km",
      seats_status: [seats2._id]
    },
    {
      source: "MANGALORE",
      destination: "NAGPUR",
      train_details: [{ number: "4208", name: "KAVERI EXPRESS", fare: 2084, travel_time: "19H:30min:21sec", start_time: "10:00" }],
      no_of_seats: { one_A: 11, two_A: 11, three_A: 11, sleeper: 11 },
      no_of_station: 31,
      distance: "3098 Km",
      seats_status: [seats3._id]
    }
  ];

  await Train.insertMany(trains);

  console.log("Creating default user...");
  try {
    const newUser = new User({ username: "testuser" });
    await User.register(newUser, "password"); // Assumes passport-local-mongoose is configured in model
  } catch (err) {
    console.error("User creation error (might already exist):", err.message);
  }

  console.log("Database seeded successfully!");
  mongoose.connection.close();
}

seedDB().catch(err => {
  console.error(err);
  mongoose.connection.close();
});
