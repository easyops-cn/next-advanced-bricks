import bodyParser from "body-parser";

/** @typedef {import("express").RequestHandler} RequestHandler */

/** @type {RequestHandler} */
const sendTask = (req, res) => {
  console.log("req.body:", req.body);
  res.send({
    id: "mock-task-id",
  });
}

/** @type {RequestHandler[]} */
const mocks = [
  bodyParser.json(),
  (req, res, next) => {
    switch (`${req.method} ${req.url}`) {
      case "POST /api/mocks/task/send":
        sendTask(req, res);
        break;
      default:
        next();
    }
  }
];

export default mocks;
