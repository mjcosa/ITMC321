// Create .env file for the mongodb connection

require("dotenv").config();

const express = require("express");

const mongoose = require("mongoose");

const v1Routes = require("./api/v1/routes/userRoutes");
const v2Routes = require("./api/v2/routes/userRoutes");

const app = express();

app.use(express.json());

mongoose.connect(process.env.MONGO_URL)
    .then(() => console.log("MongoDB connected"))
    .catch(err => console.log(err));

app.use("api", v1Routes);
app.use("api/v2", v2Routes);

app.listen(5000, () => console.log("server running at port 5000"));