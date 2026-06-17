import { CALENDAR_STYLE, INFO_STYLE, createBtnStyle, DEVICE_WIDTH, CALENDAR_GRID_START_Y, OFFSET_LAST_ROW } from "./shared-styles.js";
import { px } from "@zos/utils";

export { CALENDAR_STYLE, INFO_STYLE, DEVICE_WIDTH, CALENDAR_GRID_START_Y, OFFSET_LAST_ROW };

export const BTN_PREV_STYLE = {
  ...createBtnStyle(px(95)),
  text: "<"
};

export const BTN_NEXT_STYLE = {
  ...createBtnStyle(DEVICE_WIDTH - px(145)),
  text: ">"
};
