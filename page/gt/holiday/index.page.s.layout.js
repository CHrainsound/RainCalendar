import { CALENDAR_STYLE as BASE_CALENDAR_STYLE, INFO_STYLE as BASE_INFO_STYLE, createBtnStyle, DEVICE_WIDTH, CALENDAR_GRID_START_Y as BASE_START_Y, INFO_BOTTOM_Y as BASE_INFO_Y } from "./shared-styles.js";
import { px } from "@zos/utils";

export { DEVICE_WIDTH };
export const OFFSET_LAST_ROW = false;

export const CALENDAR_GRID_START_Y = BASE_START_Y + 30;

export const INFO_STYLE = {
  ...BASE_INFO_STYLE,
  y: px(BASE_INFO_Y + 40)
};

export const CALENDAR_STYLE = {
  ...BASE_CALENDAR_STYLE,
  y: px(80)
};

export const BTN_PREV_STYLE = {
  ...createBtnStyle(px(45)),
  y: px(80),
  text: "<"
};

export const BTN_NEXT_STYLE = {
  ...createBtnStyle(DEVICE_WIDTH - px(95)),
  y: px(80),
  text: ">"
};
