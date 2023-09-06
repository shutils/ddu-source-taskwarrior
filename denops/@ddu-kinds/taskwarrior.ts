import {
  ActionArguments,
  ActionFlags,
  Actions,
  BaseKind,
  Item,
  PreviewContext,
  Previewer,
} from "https://deno.land/x/ddu_vim@v3.6.0/types.ts";

import { ensure, is } from "https://deno.land/x/ddu_vim@v3.6.0/deps.ts";

import { ActionData, Params } from "../@ddu-sources/taskwarrior.ts";

type execArgs = {
  cmdName: string;
  taskAction: string;
  id?: string;
  input?: string | undefined;
};

const exec = async ({
  cmdName,
  taskAction,
  id,
  input,
}: execArgs): Promise<
  void
> => {
  const args = [taskAction];
  if (id) {
    args.push(id);
  }
  if (input) {
    args.push(input);
  }
  await new Deno.Command(cmdName, {
    args: args,
  }).output().then(({ stdout }) => new TextDecoder().decode(stdout));
};

const getId = (item: Item<ActionData>): string => {
  if (item.action === undefined) {
    return "0";
  }
  const action = item.action as ActionData;
  if (action.id === 0) {
    return action.uuid;
  }
  return action.id.toString();
};

export class Kind extends BaseKind<Params> {
  override actions: Actions<Params> = {
    add: async (
      { denops, sourceParams }: ActionArguments<Params>,
    ) => {
      const cmdName = sourceParams.cmdName ?? "task";
      const input = ensure(
        await denops.call("input", "Please input new task: "),
        is.String,
      );
      await exec({ cmdName: cmdName, taskAction: "add", input: input });
      return Promise.resolve(ActionFlags.RefreshItems);
    },

    append: async (
      { denops, sourceParams }: ActionArguments<Params>,
    ) => {
      const cmdName = sourceParams.cmdName ?? "task";
      const input = ensure(
        await denops.call("input", "Please input append text: "),
        is.String,
      );
      await exec({ cmdName: cmdName, taskAction: "append", input: input });
      return Promise.resolve(ActionFlags.RefreshItems);
    },

    modify: async (
      { denops, items, sourceParams }: ActionArguments<Params>,
    ) => {
      const cmdName = sourceParams.cmdName ?? "task";
      const input = ensure(
        await denops.call(
          "input",
          "Please input modifed task: ",
          (items as Array<Item<ActionData>>)[0].action?.description,
        ),
        is.String,
      );
      await exec({
        cmdName: cmdName,
        taskAction: "modify",
        id: getId((items as Array<Item<ActionData>>)[0]),
        input: input,
      });
      return Promise.resolve(ActionFlags.RefreshItems);
    },

    delete: (
      { items, sourceParams }: ActionArguments<Params>,
    ) => {
      const cmdName = sourceParams.cmdName ?? "task";
      (items as Array<Item<ActionData>>).map(async (item) => {
        await exec({
          cmdName: cmdName,
          taskAction: "delete",
          id: getId(item),
        });
      });
      return Promise.resolve(ActionFlags.RefreshItems);
    },

    purge: (
      { items, sourceParams }: ActionArguments<Params>,
    ) => {
      const cmdName = sourceParams.cmdName ?? "task";
      (items as Array<Item<ActionData>>).map(async (item) => {
        await exec({
          cmdName: cmdName,
          taskAction: "purge",
          id: getId(item),
        });
      });
      return Promise.resolve(ActionFlags.RefreshItems);
    },

    done: (
      { items, sourceParams }: ActionArguments<Params>,
    ) => {
      const cmdName = sourceParams.cmdName ?? "task";
      (items as Array<Item<ActionData>>).map(async (item) => {
        await exec({
          cmdName: cmdName,
          taskAction: "done",
          id: getId(item),
        });
      });
      return Promise.resolve(ActionFlags.RefreshItems);
    },

    annotate: async (
      { denops, items, sourceParams }: ActionArguments<Params>,
    ) => {
      const cmdName = sourceParams.cmdName ?? "task";
      const input = ensure(
        await denops.call(
          "input",
          "Please input annotate: ",
        ),
        is.String,
      );
      await exec({
        cmdName: cmdName,
        taskAction: "annotate",
        id: getId((items as Array<Item<ActionData>>)[0]),
        input: input,
      });
      return Promise.resolve(ActionFlags.RefreshItems);
    },

    start: (
      { items, sourceParams }: ActionArguments<Params>,
    ) => {
      const cmdName = sourceParams.cmdName ?? "task";
      (items as Array<Item<ActionData>>).map(async (item) => {
        await exec({
          cmdName: cmdName,
          taskAction: "start",
          id: getId(item),
        });
      });
      return Promise.resolve(ActionFlags.RefreshItems);
    },

    stop: (
      { items, sourceParams }: ActionArguments<Params>,
    ) => {
      const cmdName = sourceParams.cmdName ?? "task";
      (items as Array<Item<ActionData>>).map(async (item) => {
        await exec({
          cmdName: cmdName,
          taskAction: "stop",
          id: getId(item),
        });
      });
      return Promise.resolve(ActionFlags.RefreshItems);
    },

    deplicate: (
      { items, sourceParams }: ActionArguments<Params>,
    ) => {
      const cmdName = sourceParams.cmdName ?? "task";
      (items as Array<Item<ActionData>>).map(async (item) => {
        await exec({
          cmdName: cmdName,
          taskAction: "deplicate",
          id: getId(item),
        });
      });
      return Promise.resolve(ActionFlags.RefreshItems);
    },

    undo: async (
      { sourceParams }: ActionArguments<Params>,
    ) => {
      const cmdName = sourceParams.cmdName ?? "task";
      await exec({
        cmdName: cmdName,
        taskAction: "undo",
      });
      return Promise.resolve(ActionFlags.RefreshItems);
    },
  };

  override async getPreviewer(args: {
    actionParams: unknown;
    previewContext: PreviewContext;
    item: Item;
  }): Promise<Previewer | undefined> {
    const action = args.item.action as ActionData;
    const cmdName = action.cmdName ?? "task";
    if (!action) {
      return Promise.resolve(undefined);
    }
    return Promise.resolve({
      kind: "terminal",
      cmds: [
        cmdName,
        action.id !== 0 ? action.id.toString() : action.uuid,
        "info",
      ],
    });
  }
  params(): Params {
    return {
      cmdName: undefined,
    };
  }
}
