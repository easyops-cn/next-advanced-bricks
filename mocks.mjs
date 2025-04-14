// import bodyParser from "body-parser";
import { getTask, startTask } from "./mock-task.mjs";

/** @typedef {import("express").RequestHandler} RequestHandler */

/** @type {RequestHandler} */
const sendTask = (req, res) => {
  const task = startTask(req.body.requirement);
  res.send(task);
};

/** @type {RequestHandler} */
const getTaskDetail = (req, res) => {
  const taskId = req.query.id;
  const task = getTask(taskId);

  if (!task) {
    res.status(404).send({ error: "Task not found" });
    return;
  }

  let sent = false;
  task.subscribe(({done, value}) => {
    if (!sent) {
      res.status(200);
      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Catch-Control", "no-cache");

      sent = true;
    }

    if (value) {
      res.write(`data: ${JSON.stringify(value)}\n\n`);
    }

    if (done) {
      res.write("data: [DONE]\n\n");
      res.end();
    }
  });
};

/** @type {RequestHandler[]} */
const mocks = [
  // bodyParser.json(),
  (req, res, next) => {
    switch (`${req.method} ${req.path}`) {
      case "POST /api/mocks/task/send":
        sendTask(req, res);
        break;
      case "GET /api/mocks/task/get":
        getTaskDetail(req, res);
        break;
      default:
        next();
    }
  },
];

export default mocks;
