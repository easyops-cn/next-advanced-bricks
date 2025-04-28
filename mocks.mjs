import bodyParser from "body-parser";
import { getTask, startTask } from "./mock-task.mjs";

/** @typedef {import("express").RequestHandler} RequestHandler */

/** @type {RequestHandler} */
const sendTask = (req, res) => {
  const task = startTask(req.body.input);
  res.send(task);
};

const getTaskDetail = (req, res, taskId) => {
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
      res.setHeader("Cache-Control", "no-cache");
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

const humanInput = (req, res, taskId, jobId) => {
  const task = getTask(taskId);

  if (!task) {
    res.status(404).send({ error: "Task not found" });
    return;
  }

  try {
    task.humanInput(jobId, req.body.input);
    res.status(200).send({ message: "ok" });
  } catch (e) {
    res.status(400).send({ error: e.message });
  }
}

/** @type {RequestHandler[]} */
const mocks = [
  // Adding the line below will cause intercepted requests to hang.
  // bodyParser.json(),
  (req, res, next) => {
    switch (`${req.method} ${req.path}`) {
      case "POST /api/gateway/logic.llm.aiops_service/api/v1/llm/agent/flow/create":
        bodyParser.json()(req, res, () => sendTask(req, res));
        break;
      // case "GET /api/mocks/task/get":
      //   getTaskDetail(req, res);
      //   break;
      // case "POST /api/mocks/task/input":
      //   bodyParser.json()(req, res, () => humanInput(req, res));
      //   break;
      // default:
      //   next();
    }

    if (req.method === "GET") {
      const matchGet = req.path.match(new RegExp(
        `^/api/gateway/logic\\.llm\\.aiops_service/api/v1/llm/agent/flow/([^/]+)$`
      ));
      if (matchGet) {
        const taskId = matchGet[1];
        getTaskDetail(req, res, taskId);
        return;
      }
      next();
    } else if (req.method === "POST") {
      const matchInput = req.path.match(new RegExp(
        `^/api/gateway/logic\\.llm\\.aiops_service/api/v1/llm/agent/flow/([^/]+)/job/([^/]+)$`
      ));
      if (matchInput) {
        const taskId = matchInput[1];
        const jobId = matchInput[2];
        bodyParser.json()(req, res, () => humanInput(req, res, taskId, jobId));
        return;
      }
      next();
    }
  },
];

export default mocks;
