const express = require("express");
const dotnev = require("dotenv");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const database = mongoose.connection;
const app = express();
dotnev.config();
const authRoute = require("./routes/auth");
// app.use(
//   cors({
//     credentials: true,
//     origin:[ "http://localhost:3000","https://fakestoreapi.com/products"],
//   })
// );

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api/v1/", authRoute);
mongoose.connect(process.env.MONGO_URL);

database.on("error", (error) => {
  console.log(error);
});
database.once("connected", () => {
  console.log("Datbase is connected");
});
app.get("/", (req, res) => {
  res.send("hello");
});
const Port = process.env.PORT || 3001;

app.listen(Port, () => {
  console.log(`Server is listening at ${Port}`);
});
