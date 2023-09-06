import { FilterArguments } from "https://deno.land/x/ddu_vim@v3.6.0/base/filter.ts";
import {
  BaseFilter,
  DduItem,
  Item,
} from "https://deno.land/x/ddu_vim@v3.6.0/types.ts";
import { ActionData } from "../@ddu-sources/taskwarrior.ts";

type Params = Record<string, string>;

const statusIcon: Record<string, string> = {
  pending: "",
  completed: "",
  deleted: "D",
};

export class Filter extends BaseFilter<Params> {
  filter(args: FilterArguments<Params>): Promise<DduItem[]> {
    const items = args.items as Item<ActionData>[];
    const newItems = items.map((item) => {
      const status = String(item.action?.status);
      const newItem = {
        ...item,
        display: `${statusIcon[status] ?? " "}  ${item.action?.description}`,
      };
      return newItem;
    });
    return Promise.resolve(newItems as DduItem[]);
  }

  params(): Params {
    return {};
  }
}
