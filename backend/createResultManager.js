const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("./models/User");
dotenv.config();
const connectDB = require("./config/db");

const createResultManager = async () => {
  try {
    await connectDB();

    const userExists = await User.findOne({ email: "resultmanager@a7satta.vip" });
    if (userExists) {
      console.log("Result Manager user already exists!");
      process.exit();
    }

    const user = await User.create({
      email: "resultmanager@a7satta.vip",
      password: "result@01255",
      role: "result-manager",
    });

    console.log("Result Manager user created successfully!");
    console.log(`Email: ${user.email}`);
    console.log(`Password: result123`);
    process.exit();
  } catch (err) {
    console.error("Error creating result manager:", err);
    process.exit(1);
  }
};

createResultManager();
