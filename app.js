import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./database/connect.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "./database/models/User.js";

dotenv.config();

const app = express();

app.use(express.json());

const port = 8080;

var salt = bcrypt.genSaltSync(10);
const jwtSecret = process.env.ACCESS_TOKEN;

const calculateAge = (dob) => {
  const diff = Date.now() - new Date(dob).getTime();
  const age = new Date(diff).getUTCFullYear() - 1970;
  return age;
};

// Middleware to authenticate using JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Extract token from "Bearer token"

  if (token == null)
    return res.status(401).json({ message: "Token is missing" });

  jwt.verify(token, jwtSecret, (err, user) => {
    if (err) return res.status(403).json({ message: "Invalid token" });

    req.user = user;
    next();
  });
};

app.get("/test", (req, res) => {
  res.json("test ok");
});

app.post("/login", async (req, res) => {
  const userData = req.body;
  const { email, password } = userData;
  try {
    const user = await User.findOne({
      email: email,
    });
    if (user) {
      const checkPass = bcrypt.compareSync(password, user.password);
      if (checkPass) {
        const token = jwt.sign(
          {
            email: user.email,
            id: user._id,
          },
          jwtSecret,
          { expiresIn: "1h" }
        );

        res.json({ token, user });
      } else {
        console.log("Password is incorrect");
        res.status(422).json("password not matched");
      }
    } else {
      return res.status(400).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post("/register", async (req, res) => {
  const userData = req.body;
  const { phone, email, name, dob, monthlySalary, password } = userData;
  try {
    const age = calculateAge(dob);
    if (age < 20 || monthlySalary < 25000) {
      return res
        .status(400)
        .json({ message: "User does not meet the criteria" });
    }

    const newUser = await User.create({
      phone,
      email,
      name,
      dob,
      monthlySalary,
      password: bcrypt.hashSync(password, salt),
      purchasePower: 0,
    });
    res.status(200).json({ message: "User created successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get("/user", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post("/borrow", authenticateToken, async (req, res) => {
  const { amount } = req.body;
  try {
    const user = await User.findById(req.user.id);

    // Update Purchase Power amount
    user.purchasePower += amount;

    // Calculate repayment details
    const interestRate = 0.08;
    const monthlyRepayment = (amount * (1 + interestRate)) / 12;

    await user.save();
    res.json({
      purchasePower: user.purchasePower,
      monthlyRepayment,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

const startServer = async () => {
  try {
    connectDB(process.env.MONGODB_URL);
  } catch (error) {
    console.error("Error connecting to MongoDb");
  }
  app.listen(port, () => {
    console.log(`Server started on port: http://localhost:${port}/`);
  });
};

startServer();
