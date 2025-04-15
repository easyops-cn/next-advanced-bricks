import bodyParser from "body-parser";
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
  task.subscribe(({ done, value }) => {
    if (!sent) {
      res.status(200);
      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Catch-Control", "no-cache");
      res.flushHeaders();

      sent = true;
    }

    if (value) {
      res.write(`data: ${JSON.stringify(value)}\n\n`);
      // `flush` is added by [compression](https://www.npmjs.com/package/compression)
      res.flush?.();
    }

    if (done) {
      res.write("data: [DONE]\n\n");
      res.end();
    }
  });
};

const inputTask = (req, res) => {
  const taskId = req.body.id;
  const jobId = req.body.jobId;
  const task = getTask(taskId);

  if (!task) {
    res.status(404).send({ error: "Task not found" });
    return;
  }

  try {
    task.inputTask(jobId, req.body.input);
  } catch (e) {
    res.status(400).send({ error: e.message });
    return;
  }

  let sent = false;
  task.subscribe(({ done, value }) => {
    if (!sent) {
      res.status(200);
      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Catch-Control", "no-cache");
      res.flushHeaders();

      sent = true;
    }

    if (value) {
      res.write(`data: ${JSON.stringify(value)}\n\n`);
      // `flush` is added by [compression](https://www.npmjs.com/package/compression)
      res.flush?.();
    }

    if (done) {
      res.write("data: [DONE]\n\n");
      res.end();
    }
  });
}

/** @type {RequestHandler[]} */
const mocks = [
  // Adding the line below will cause intercepted requests to hang.
  // bodyParser.json(),
  (req, res, next) => {
    switch (`${req.method} ${req.path}`) {
      case "POST /api/mocks/task/send":
        bodyParser.json()(req, res, () => sendTask(req, res));
        break;
      case "GET /api/mocks/task/get":
        getTaskDetail(req, res);
        break;
      case "POST /api/mocks/task/input":
        bodyParser.json()(req, res, () => inputTask(req, res));
        break;
      default:
        next();
    }
  },
];

export default mocks;
