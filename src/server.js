const express = require("express");
const cors = require("cors");
const listEndpoints = require("express-list-endpoints");
const mongoose = require("mongoose");

const productsRouter = require("./services/Products")

const {
  notFoundHandler,
  unauthorizedHandler,
  forbiddenHandler,
  badRequestErrorHandler,
  catchAllHandler,
} = require("./errorHandeling");

const server = express();

const port = process.env.port;
server.use(express.json());
server.use(cors());
server.use("/products", productsRouter)

server.use(notFoundHandler);
server.use(unauthorizedHandler);
server.use(forbiddenHandler);
server.use(badRequestErrorHandler);
server.use(catchAllHandler);

console.log(listEndpoints(server));

mongoose
  .connect(process.env.MONGO_CONNECTION, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(
    server.listen(port, () => {
      console.log("Running on port", port);
    })
  )
  .catch((error) => console.log(error));
