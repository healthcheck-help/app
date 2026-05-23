export { Accordion } from "bits-ui";
export { default as Alert } from "./components/Alert.svelte";

import { DropdownMenu as BitsDropdownMenu } from "bits-ui";
import DropdownMenuRoot from "./components/DropdownMenu.svelte";

type DropdownMenuSubComponents = {
  Group: typeof BitsDropdownMenu.Group;
  Item: typeof BitsDropdownMenu.Item;
  Separator: typeof BitsDropdownMenu.Separator;
  CheckboxItem: typeof BitsDropdownMenu.CheckboxItem;
  RadioGroup: typeof BitsDropdownMenu.RadioGroup;
  RadioItem: typeof BitsDropdownMenu.RadioItem;
  Sub: typeof BitsDropdownMenu.Sub;
  SubTrigger: typeof BitsDropdownMenu.SubTrigger;
  SubContent: typeof BitsDropdownMenu.SubContent;
};

export const DropdownMenu: typeof DropdownMenuRoot & DropdownMenuSubComponents =
  Object.assign(DropdownMenuRoot, {
    Group: BitsDropdownMenu.Group,
    Item: BitsDropdownMenu.Item,
    Separator: BitsDropdownMenu.Separator,
    CheckboxItem: BitsDropdownMenu.CheckboxItem,
    RadioGroup: BitsDropdownMenu.RadioGroup,
    RadioItem: BitsDropdownMenu.RadioItem,
    Sub: BitsDropdownMenu.Sub,
    SubTrigger: BitsDropdownMenu.SubTrigger,
    SubContent: BitsDropdownMenu.SubContent,
  });

export { default as Input } from "./components/Input.svelte";
export { default as Select } from "./components/Select.svelte";
export { default as NarrowContainer } from "./layouts/NarrowContainer.svelte";
