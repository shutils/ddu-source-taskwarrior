import {
  BaseFilter,
  DduItem,
  Item,
} from "https://deno.land/x/ddu_vim@v3.6.0/types.ts";
import { ActionData } from "../@ddu-sources/taskwarrior.ts";

function getUrgency(item: DduItem) {
  if ((item as Item<ActionData>).action?.status !== "pending") {
    return 0;
  }
  if ((item as Item<ActionData>).action?.urgency) {
    return (item as Item<ActionData>).action?.urgency;
  }
  return 0;
}

type Params = Record<never, never>;

export class Filter extends BaseFilter<Params> {
  filter(args: {
    items: DduItem[];
  }): Promise<DduItem[]> {
    return Promise.resolve(args.items.sort((a, b) => {
      return getUrgency(b) - getUrgency(a);
    }));
  }

  params(): Params {
    return {};
  }
}
