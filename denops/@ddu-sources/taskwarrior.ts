import { BaseSource, Item } from "https://deno.land/x/ddu_vim@v3.6.0/types.ts";
import {
  GatherArguments,
} from "https://deno.land/x/ddu_vim@v3.6.0/base/source.ts";

export type Params = {
  cmdName: string | undefined;
  filter: Array<string> | undefined;
};

export type ActionData = {
  id: number;
  uuid: string;
  description: string;
  status: string;
  cmdName: string;
};

type Task = {
  id: number;
  uuid: string;
  description: string;
  status: string;
};

const getTasks = async (
  cmdName: string,
  filter: Array<string>,
): Promise<Array<Task>> => {
  const cmdArgs: string[] = [...filter, "export"];
  const taskJson = await new Deno.Command(cmdName, {
    args: cmdArgs,
  }).output().then(({ stdout }) => new TextDecoder().decode(stdout));
  const tasks: Array<Task> = JSON.parse(taskJson);
  return Promise.resolve(tasks);
};

export class Source extends BaseSource<Params> {
  override kind = "taskwarrior";

  override gather(
    { sourceParams }: GatherArguments<Params>,
  ): ReadableStream<Item<ActionData>[]> {
    return new ReadableStream({
      async start(controller) {
        const items: Array<Item<ActionData>> = [];
        const cmdName = sourceParams.cmdName ? sourceParams.cmdName : "task";
        const filter = sourceParams.filter ?? [];
        const taskArray = await getTasks(cmdName, filter);
        taskArray.map((task) => {
          items.push({
            word: `${task.status} ${task.id ? task.id : task.uuid
              } ${task.description}`,
            action: {
              ...task,
              cmdName: cmdName,
            },
          });
        });
        controller.enqueue(items);
        controller.close();
      },
    });
  }

  override params(): Params {
    return {
      cmdName: undefined,
      filter: undefined,
    };
  }
}
