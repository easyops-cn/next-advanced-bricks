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

  return {
    data: {
      taskId: id,
    },
  };
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
        plan: [],
        startTime: 1745570717,
        __delay: 1000,
      },
      {
        state: "confirming-plan",
        jobs: [
          {
            id: "mock-job-id-0",
            startTime: 1745572717,
            state: "input-required",
            instruction: "确定计划",
            toolCall: {
              name: "ask_human_confirming_plan",
              arguments: JSON.stringify({
                question:
                  "请补充完整的系统信息，包括系统编码、运维负责人（默认为当前用户）。",
                steps: [
                  "创建系统",
                  "创建环境",
                  "关联主机到环境中",
                  "创建基于Agent扫描的节点发现任务",
                  "智能节点聚类",
                ],
              }),
            },
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
            id: "mock-job-id-0",
            startTime: 1745572717,
            state: "completed",
            instruction: "确定计划",
            toolCall: {
              name: "ask_human_confirming_plan",
              arguments: JSON.stringify({
                question:
                  "请补充完整的系统信息，包括系统编码、运维负责人（默认为当前用户）。",
                steps: [
                  "创建系统",
                  "创建环境",
                  "关联主机到环境中",
                  "创建基于Agent扫描的节点发现任务",
                  "智能节点聚类",
                ],
              }),
            },
            messages: [
              {
                role: "tool",
                parts: [{
                  type: "text",
                  text: this.#input,
                }]
              }
            ]
          },
        ],
      },
        {
          state: "working",
          jobs: [],
          plan: [
            {
              id: "mock-job-id-1",
              instruction: "创建系统",
            },
            {
              id: "mock-job-id-2",
              instruction: "创建环境",
            },
            // {
            //   id: "mock-job-id-3",
            //   instruction: "安装Agent",
            // },
            {
              id: "mock-job-id-4",
              instruction: "关联主机到环境中",
            },
            {
              id: "mock-job-id-5",
              instruction: "创建基于Agent扫描的节点发现任务",
            },
            {
              id: "mock-job-id-6",
              instruction: "智能节点聚类",
            },
          ],
          __delay: 200,
        },
        {
          jobs: [
            {
              id: "mock-job-id-1",
              upstream: ["mock-job-id-0"],
              state: "submitted",
              startTime: 1745572717,
              instruction: "创建系统",
            },
          ],
          __delay: 4000,
        },
        {
          jobs: [
            {
              id: "mock-job-id-1",
              state: "working",
              messages: [
                {
                  role: "assistant",
                  parts: [
                    {
                      type: "text",
                      text: "准备创建 XX 系统\n\n| Name | Age | Profile |\n| - | - | - |\n| Tom | 23 | Playing basketball, hiking, etc,.  |\n| Lucy | 21 | Reading, music, movies, ... |",
                    },
                  ],
                },
              ],
            },
          ],
          __delay: 100,
        },
        {
          plan: [
            {
              id: "mock-job-id-1",
              instruction: "创建系统",
            },
            {
              id: "mock-job-id-1-a",
              instruction: "要求用户补充完整的系统信息",
            },
            {
              id: "mock-job-id-2",
              instruction: "创建环境",
            },
            // {
            //   id: "mock-job-id-3",
            //   instruction: "安装Agent",
            // },
            {
              id: "mock-job-id-4",
              instruction: "关联主机到环境中",
            },
            {
              id: "mock-job-id-5",
              instruction: "创建基于Agent扫描的节点发现任务",
            },
            {
              id: "mock-job-id-6",
              instruction: "智能节点聚类",
            },
          ],
          jobs: [
            {
              id: "mock-job-id-1",
              state: "completed",
            },
            {
              id: "mock-job-id-1-a",
              upstream: ["mock-job-id-1"],
              startTime: 1745574717,
              instruction: "要求用户补充完整的系统信息",
              state: "working",
            },
          ],
          __delay: 500,
        },
        {
          state: "input-required",
          jobs: [
            {
              id: "mock-job-id-1-a",
              instruction: "要求用户补充完整的系统信息",
              state: "input-required",
              toolCall: {
                name: "ask_human",
                arguments: JSON.stringify({
                  command: "ask_user_more",
                  question:
                    "请补充完整的系统信息，包括系统编码、运维负责人（默认为当前用户）。",
                }),
              },
            },
          ],
          __delay: 500,
        },
      );
    }

    if (this.#input2) {
      stream.splice(
        stream.length - 1,
        1,
        {
          state: "working",
          jobs: [
            {
              id: "mock-job-id-1-a",
              state: "completed",
              toolCall: {
                name: "ask_human",
                arguments: JSON.stringify({
                  command: "ask_user_more",
                  question:
                    "请补充完整的系统信息，包括系统编码、运维负责人（默认为当前用户）。",
                }),
              },
              messages: [
                {
                  role: "tool",
                  parts: [
                    {
                      type: "text",
                      text: this.#input2,
                    },
                  ],
                },
              ],
            },
          ],
          __delay: 1000,
        },
        {
          // plan: [],
          jobs: [
            {
              id: "mock-job-id-2",
              state: "submitted",
              startTime: 1745576717,
              upstream: ["mock-job-id-1-a"],
              instruction: "创建环境",
            },
          ],
          __delay: 1000,
        },
        {
          state: "input-required",
          jobs: [
            {
              id: "mock-job-id-2",
              state: "input-required",
              toolCall: {
                name: "ask_human",
                arguments: JSON.stringify({
                  command: "ask_user_confirm",
                  question:
                    "将创建测试环境，ID 为 env-test，别名开发测试，是否继续？",
                }),
              },
            },
          ],
          __delay: 1000,
        }
      );
    }

    if (this.#input3) {
      stream.splice(
        stream.length - 1,
        1,
        {
          state: "working",
          jobs: [
            {
              id: "mock-job-id-2",
              state: "completed",
              toolCall: {
                name: "ask_human",
                arguments: JSON.stringify({
                  command: "ask_user_confirm",
                  question:
                    "将创建测试环境，ID 为 env-test，别名开发测试，是否继续？",
                }),
              },
              messages: [
                {
                  role: "tool",
                  parts: [
                    {
                      type: "text",
                      text: this.#input3,
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
              id: "mock-job-id-4",
              startTime: 1745578717,
              upstream: ["mock-job-id-2"],
              state: "submitted",
              instruction: "关联主机到环境中",
            },
          ],
          __delay: 200,
        },
        {
          state: "input-required",
          jobs: [
            {
              id: "mock-job-id-4",
              state: "input-required",
              toolCall: {
                name: "ask_human",
                arguments: JSON.stringify({
                  command: "ask_user_select_from_cmdb",
                  question: "请提供要关联的主机 IP 列表。",
                  objectId: "HOST",
                  attrId: "ip",
                }),
              },
            },
          ],
          __delay: 200,
        },
      );
    }

    if (this.#input4) {
      stream.splice(
        stream.length - 1,
        1,
        {
          state: "working",
          jobs: [
            {
              id: "mock-job-id-4",
              state: "completed",
              toolCall: {
                name: "ask_human",
                arguments: JSON.stringify({
                  command: "ask_user_select_from_cmdb",
                  question: "请提供要关联的主机 IP 列表。",
                  objectId: "HOST",
                  attrId: "ip",
                }),
              },
              messages: [
                {
                  role: "tool",
                  parts: [
                    {
                      type: "text",
                      text: this.#input4,
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
              id: "mock-job-id-5",
              startTime: 1745580717,
              upstream: ["mock-job-id-4"],
              state: "submitted",
              instruction: "创建基于Agent扫描的节点发现任务",
            },
          ],
          __delay: 200,
        },
        {
          jobs: [
            {
              id: "mock-job-id-5",
              state: "working",
              toolCall: {
                name: "cmdb_create_agent_scan_job",
                arguments: '{"ips":["1.2.3.4","1.2.3.5"]}',
              },
            },
          ],
          __delay: 2000,
        },
        {
          jobs: [
            {
              id: "mock-job-id-5",
              state: "working",
              messages: [
                {
                  role: "tool",
                  parts: [
                    {
                      type: "text",
                      text: '{"jobId":"agent-scan-job-1"}',
                    },
                  ],
                }
              ],
            },
          ],
          __delay: 1000,
        },
        {
          jobs: [
            {
              id: "mock-job-id-5",
              state: "completed",
              messages: [
                {
                  role: "assistant",
                  parts: [
                    {
                      type: "text",
                      text: "\n\n已完成Agent扫描的节点发现任务。",
                    },
                  ],
                }
              ],
            },
          ],
          __delay: 200,
        },
        {
          jobs: [
            {
              id: "mock-job-id-6",
              startTime: 1745580717,
              upstream: ["mock-job-id-5"],
              state: "submitted",
              instruction: "智能节点聚类",
            },
          ],
          __delay: 2000,
        },
        {
          jobs: [
            {
              id: "mock-job-id-6-a",
              startTime: 1745582717,
              parent: "mock-job-id-6",
              state: "working",
            },
            {
              id: "mock-job-id-6-b",
              startTime: 1745582717,
              parent: "mock-job-id-6",
              state: "working",
            },
          ],
        },
        {
          jobs: [
            {
              id: "mock-job-id-6-a",
              state: "completed",
              messages: [{
                role: "assistant",
                parts: [{ type: "text", text: "Sub task A done." }]
              }],
            },
            {
              id: "mock-job-id-6-b",
              state: "completed",
              messages: [{
                role: "assistant",
                parts: [{ type: "text", text: "Sub task B done, too." }]
              }],
            },
          ],
        },
        {
          jobs: [
            {
              id: "mock-job-id-6-c",
              startTime: 1745584717,
              parent: "mock-job-id-6",
              upstream: ["mock-job-id-6-a", "mock-job-id-6-b"],
              state: "working",
            },
          ],
        },
        {
          jobs: [
            {
              id: "mock-job-id-6-c",
              state: "completed",
              messages: [{
                role: "assistant",
                parts: [{ type: "text", text: "Sub task C done, finally." }]
              }],
            },
          ],
        },
        {
          state: "completed",
          jobs: [
            {
              id: "mock-job-id-6",
              state: "completed",
              instruction: "智能节点聚类",
              messages: [
                {
                  role: "assistant",
                  parts: [
                    {
                      type: "text",
                      text: "对系统的指定环境，根据环境中主机关联的部署实例进行智能聚类，帮助用户自动创建应用、服务，并关联好系统-应用-服务-部署实例的关联、服务与环境的关联。",
                    },
                  ],
                }
              ],
            },
          ],
          __delay: 200,
        },
      );
    }

    return stream;
  }
  #baseDetail;
  #input;
  #input2;
  #input3;
  #input4;
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
      if (event.state === "completed") {
        for (const subscriber of this.#subscribers) {
          subscriber({
            done: true,
          });
        }
        this.#subscribers.clear();
      }
    } else {
      setTimeout(this.#next, event.__delay ?? 2000);
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

  humanInput(jobId, input /* , callback */) {
    const { value: task } = this.#mergeTask();
    const job = task.jobs?.find((job) => job.id === jobId);

    if (!job) {
      throw new Error("Job not found");
    }

    if (job.state !== "input-required") {
      throw new Error("Job is not in input-required state");
    }

    // this.#subscribers.add(callback);
    if (this.#input3) {
      this.#input4 = input;
    } if (this.#input2) {
      this.#input3 = input;
    } else if (this.#input) {
      this.#input2 = input;
    } else {
      this.#input = input;
    }
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
