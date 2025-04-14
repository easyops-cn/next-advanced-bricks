/* eslint-disable no-console */
/** @type {Map<string, MockTask>} */
const pool = new Map();

export function startTask(requirement) {
  const id = `mock-task-${pool.size + 1}`;
  const task = {
    id,
    requirement,
    state: "submitted",
  };
  pool.set(id, new MockTask(task));

  return task;
}

/**
 * @param {string} id Task ID
 * @returns {MockTask | undefined}
 */
export function getTask(id) {
  return pool.get(id);
}

class MockTask {
  #cursor = -1;
  #getEventStream() {
    return [
      {
        state: "working",
        jobs: [],
        __delay: 2000,
      },
      {
        jobs: [
          {
            id: "mock-job-id-1",
            state: "working",
            instruction: "Say hello to the world",
            tool: "hello-tool",
          },
        ],
        __delay: 2000,
      },
      {
        jobs: [
          {
            id: "mock-job-id-1",
            messages: [
              {
                role: "agent",
                parts: [
                  {
                    type: "text",
                    text: "Hello",
                  },
                  {
                    type: "text",
                    text: " world",
                  },
                ],
              },
            ],
          },
        ],
        __delay: 1000,
      },
      {
        jobs: [
          {
            id: "mock-job-id-1",
            messages: [
              {
                role: "agent",
                parts: [
                  {
                    type: "text",
                    text: "\n\n",
                  },
                  {
                    type: "text",
                    text: "How",
                  },
                  {
                    type: "text",
                    text: " are you?",
                  },
                ],
              },
            ],
          },
        ],
        __delay: 200,
      },
      {
        jobs: [
          {
            id: "mock-job-id-1",
            state: "completed",
          },
          {
            id: "mock-job-id-2",
            parent: "mock-job-id-1",
            state: "working",
            instruction: "Say thank you",
            tool: "thank-you-tool",
          },
        ],
        __delay: 2000,
      },
      {
        jobs: [
          {
            id: "mock-job-id-2",
            parent: "mock-job-id-1",
            messages: [
              {
                role: "agent",
                parts: [
                  {
                    type: "text",
                    text: "Fine",
                  },
                  {
                    type: "text",
                    text: ", thank you!",
                  }
                ],
              },
            ],
          },
        ],
        __delay: 1000,
      },
      {
        jobs: [
          {
            id: "mock-job-id-2",
            parent: "mock-job-id-1",
            messages: [
              {
                role: "agent",
                parts: [
                  {
                    type: "text",
                    text: " And you?",
                  },
                ],
              },
            ],
          },
        ],
        __delay: 200,
      },
      {
        state: "input-required",
        jobs: [
          {
            id: "mock-job-id-1",
            state: "input-required",
          },
        ],
      },
    ];
  }
  #baseDetail;
  #subscribers = new Set();

  #next = () => {
    this.#cursor++;
    const allEventStream = this.#getEventStream();
    const event = allEventStream[this.#cursor];

    if (!event) {
      console.error("Unexpected: no more events");
      return;
    }

    for (const subscriber of this.#subscribers) {
      subscriber({
        done: false,
        value: event,
      });
    }

    if (this.#cursor === allEventStream.length - 1) {
      for (const subscriber of this.#subscribers) {
        subscriber({
          done: true,
        });
      }
      this.#subscribers.clear();
    } else {
      setTimeout(this.#next, event.__delay ?? 2000);
    }
  }

  constructor(baseDetail) {
    this.#baseDetail = baseDetail;
    this.#next();
  }

  subscribe(callback) {
    const result = this.#mergeTask();
    callback(result);
    if (!result.done) {
      this.#subscribers.add(callback);
    }
  }

  #mergeTask() {
    const allEventStream = this.#getEventStream();
    const task = allEventStream.slice(0, this.#cursor + 1).reduce((acc, event) => {
      const { jobs: jobsPatch, __delay, ...restEvent } = event;

      if (jobsPatch) {
        const jobs = acc.jobs?.slice() ?? [];
        const previousJobsMap = new Map(jobs.map(job => [job.id, job]));

        for (const patch of jobsPatch) {
          const previousJob = previousJobsMap.get(patch.id);
          if (previousJob) {
            this.#mergeJob(previousJob, patch);
          } else {
            jobs.push(patch);
          }
        }

        restEvent.jobs = jobs;
      }

      return { ...acc, ...restEvent };
    }, this.#baseDetail);

    return {
      done: this.#cursor === allEventStream.length - 1,
      value: task
    };
  }

  #mergeJob(previousJob, patch) {
    const { messages, ...restPatch } = patch;

    if (messages) {
      restPatch.messages = [...(previousJob.messages ?? []), ...messages];
    }

    Object.assign(previousJob, restPatch);
  }
}
