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
    const stream = [
      {
        state: "submitted",
        jobs: [],
        plans: [],
        __delay: 2000,
      },
      {
        state: "working",
        jobs: [],
        plans: [
          {
            id: "mock-job-id-1",
            instruction: "Say hello to the world",
          },
          {
            id: "mock-job-id-2",
            instruction: "Say thank you",
          },
        ],
        __delay: 200,
      },
      {
        jobs: [
          {
            id: "mock-job-id-1",
            state: "submitted",
            instruction: "Say hello to the world",
            tag: "hello-tool",
          },
        ],
        __delay: 2000,
      },
      {
        jobs: [
          {
            id: "mock-job-id-1-a",
            state: "working",
            parent: ["mock-job-id-1"],
          },
          {
            id: "mock-job-id-1-b",
            state: "working",
            parent: ["mock-job-id-1"],
          },
        ],
        __delay: 1000,
      },
      {
        jobs: [
          {
            id: "mock-job-id-1-a",
            state: "working",
            messages: [
              {
                role: "assistant",
                parts: [
                  {
                    type: "text",
                    text: "Hello",
                  },
                ],
              },
            ],
          },
          {
            id: "mock-job-id-1-b",
            messages: [
              {
                role: "assistant",
                parts: [
                  {
                    type: "text",
                    text: "How",
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
            id: "mock-job-id-1-a",
            state: "working",
            messages: [
              {
                role: "assistant",
                parts: [
                  {
                    type: "text",
                    text: " world",
                  },
                ],
              },
            ],
          },
          {
            id: "mock-job-id-1-b",
            messages: [
              {
                role: "assistant",
                parts: [
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
            id: "mock-job-id-1-a",
            state: "completed",
          },
          {
            id: "mock-job-id-1-b",
            state: "completed",
          },
          {
            id: "mock-job-id-2",
            parent: ["mock-job-id-1-a", "mock-job-id-1-b"],
            state: "submitted",
            instruction: "Say thank you",
            tag: "thank-you-tool",
          },
        ],
        __delay: 2000,
      },
      {
        jobs: [
          {
            id: "mock-job-id-2",
            messages: [
              {
                role: "assistant",
                parts: [
                  {
                    type: "text",
                    text: "Fine",
                  },
                  {
                    type: "text",
                    text: ", thank you!",
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
            id: "mock-job-id-2",
            messages: [
              {
                role: "assistant",
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
            id: "mock-job-id-2",
            state: "input-required",
            // messages: [
            //   {
            //     role: "assistant",
            //     parts: [{
            //       type: "data",
            //       data: {
            //         tag: "user-confirm",
            //         options: [
            //           {
            //             label: "确定",
            //             value: "confirm",
            //           },
            //           {
            //             label: "取消",
            //             value: "cancel",
            //           },
            //         ]
            //       }
            //     }]
            //   }
            // ]
          },
        ],
      },
    ];

    if (this.#input) {
      stream.splice(
        stream.length - 1,
        1,
        {
          state: "working",
          jobs: [
            {
              id: "mock-job-id-2",
              state: "working",
              messages: [
                {
                  role: "user",
                  parts: [
                    {
                      type: "text",
                      text: this.#input,
                    },
                  ],
                },
              ],
            },
          ],
          __delay: 2000,
        },
        {
          jobs: [
            {
              id: "mock-job-id-2",
              state: "working",
              messages: [
                {
                  role: "assistant",
                  parts: [
                    {
                      type: "text",
                      text: "Alright alright",
                    },
                  ],
                },
              ],
            },
          ],
          __delay: 2000,
        },
        {
          // plans: [],
          jobs: [
            {
              id: "mock-job-id-2",
              state: "completed",
              messages: [
                {
                  role: "assistant",
                  parts: [
                    {
                      type: "text",
                      text: " alright.",
                    },
                  ],
                },
              ],
            },
            {
              id: "mock-job-id-3",
              state: "submitted",
              parent: ["mock-job-id-2"],
              instruction: "Say goodbye",
            },
          ],
          __delay: 1000,
        },
        {
          jobs: [
            {
              id: "mock-job-id-3",
              state: "working",
              messages: [
                {
                  role: "assistant",
                  parts: [
                    {
                      type: "text",
                      text: "Goodbye",
                    },
                  ],
                }
              ],
            }
          ],
          __delay: 200,
        },
        {
          state: "completed",
          jobs: [
            {
              id: "mock-job-id-3",
              state: "completed",
            }
          ]
        },
      );
    }

    return stream;
  }
  #baseDetail;
  #input;
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
      setTimeout(this.#next, (event.__delay ?? 2000));
    }
  };

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

  humanInput(jobId, input, callback) {
    const { value: task } = this.#mergeTask();
    const job = task.jobs?.find((job) => job.id === jobId);

    if (!job) {
      throw new Error("Job not found");
    }

    if (job.state !== "input-required") {
      throw new Error("Job is not in input-required state");
    }

    this.#subscribers.add(callback);
    this.#input = input;
    this.#cursor--;
    setTimeout(this.#next, 500);
  }

  #mergeTask() {
    const allEventStream = this.#getEventStream();
    const task = allEventStream
      .slice(0, this.#cursor + 1)
      .reduce((acc, event) => {
        const { jobs: jobsPatch, __delay, ...restEvent } = event;

        if (jobsPatch) {
          const jobs = acc.jobs?.slice() ?? [];
          const previousJobsMap = new Map(jobs.map((job) => [job.id, job]));

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
      value: task,
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
