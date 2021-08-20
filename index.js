const express = require("express");
const formidableMiddleware = require("express-formidable");
const mongoose = require("mongoose");
require("dotenv").config();
const cors = require("cors");

const app = express();

app.use(formidableMiddleware());
app.use(cors());

mongoose.connect(process.env.MONGODB_URI),
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  };

const Drug = mongoose.model("Drug", {
  name: String,
  quantity: Number,
});

app.post("/create", async (req, res) => {
  try {
    const name = new RegExp(req.fields.name, "i");
    const existingDrug = await Drug.findOne({ name: name });

    if (existingDrug === null) {
      const newDrug = new Drug({
        name: req.fields.name,
        quantity: req.fields.quantity,
      });
      await newDrug.save();
      res.json(newDrug);
    } else {
      res.status(400).json({
        error: { message: "Drug already exists" },
      });
    }
  } catch (error) {
    res.status(400).json({ error: { message: "Ca n'a pas voulu créer" } });
  }
});

app.get("/", async (req, res) => {
  try {
    const drugs = await Drug.find();
    res.json(drugs);
  } catch (error) {
    res.status(400).json({ message: "An error occured" });
  }
});

app.post("/drugs/add", async (req, res) => {
  try {
    const drug = await Drug.findById(req.fields.id);
    if (drug !== null) {
      drug.quantity = drug.quantity + req.fields.quantity;
      await drug.save();
      res.json({ message: "Quantity modified" });
    }
  } catch (error) {
    res.status(400).json({ message: "Bad request" });
  }
});

app.post("/drugs/remove", async (req, res) => {
  try {
    const drug = await Drug.findById(req.fields.id);
    if (drug !== null) {
      if (drug.quantity >= req.fields.quantity) {
        drug.quantity = drug.quantity - req.fields.quantity;
        await drug.save();
      }
      res.json({ message: "Quantity modified" });
    } else {
      res.status(400).json({ message: "Invalid quantity" });
    }
  } catch (error) {
    res.status(400).json({ message: "Bad request" });
  }
});

app.all("*", () => {
  res.json({ message: "Page not found" });
});

app.listen(process.env.PORT, () => {
  console.log("Server started");
});
