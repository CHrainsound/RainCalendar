import { CALENDAR_STYLE, INFO_STYLE, createBtnStyle, DEVICE_WIDTH } from "./shared-styles.js";
import { px } from "@zos/utils";

export { CALENDAR_STYLE, INFO_STYLE, DEVICE_WIDTH };

export const BTN_PREV_STYLE = {
  ...createBtnStyle(px(45)),
  text: "<"
};

export const BTN_NEXT_STYLE = {
  ...createBtnStyle(DEVICE_WIDTH - px(95)),
  text: ">"
};
