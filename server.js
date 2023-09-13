const express = require("express");
const jwt = require("jsonwebtoken");
const app = express();
const bcrypt = require("bcrypt");
// const { v4: uuidv4 } = require("uuid");
app.use(express.json());

const users = [
  {
    name: "ali",
    password: "$2b$10$UPWnGhmtUX62MIqcxEk2JeOh4RWnD0797QJtmyLShMgWQShK0cZta",
  },
  {
    name: "owais",
    password: "$2b$10$jo4HKreXfyDs82VOkgogx.qwB1du2wO25q4Gtm8njTINSBj0wxbTO",
  },
];
app.get("/users", (req, res) => {
  res.json(users);
});

app.post("/users", async (req, res) => {
  try {
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(req.body.password, salt);
    console.log(salt);
    console.log(hashedPassword);
    const user = {
      name: req.body.name,
      password: hashedPassword,
    };
    users.push(user);
    res.status(201).send();
  } catch (error) {
    res.status(500);
  }
});

// const userTokenMap = new Map();
app.post("/users/login", async (req, res) => {
  const user = users.find((user) => user.name === req.body.name);
  if (user == null) {
    return res.status(400).send("cant find user");
  }

  try {
    if (await bcrypt.compare(req.body.password, user.password)) {
      jwt.sign({ user }, "secretkey", (err, token) => {
        res.json({
          token,
        });
      });
      // res.send("success");
      // const uuidToken = uuidv4();
      // userTokenMap.set(uuidToken, user);

      // res.send(`Success, your token is ${uuidToken}`);
    } else {
      res.send("incorrect passwpord");
    }
  } catch (error) {
    res.status(500).send();
  }
});

app.post("/greeting", verifyToken, (req, res) => {
  // const uuidToken = req.header("Authorization");

  // const user = userTokenMap.get(uuidToken);
  jwt.verify(req.token, "secretkey", (err, authData) => {
    if (err) {
      res.send(403);
    } else {
      res.json({
        message: "good morning",
        authData,
      });
    }
  });
});

function verifyToken(req, res, next) {
  const bearerHeader = req.headers["authorization"];
  if (typeof bearerHeader !== "undefined") {
    const bearer = bearerHeader.split(" ");
    const bearerToken = bearer[1];
    req.token = bearerToken;
    console.log(req.token);
    next();
  } else {
    res.sendStatus(403);
  }
}
app.listen(3000);
