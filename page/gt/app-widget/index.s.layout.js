import { getDeviceInfo } from "@zos/device";
import { px } from "@zos/utils";
import { WIDGET_HEIGHT, TITLE_STYLE, TODAY_STYLE, NEXT_HOLIDAY_STYLE } from "./shared-styles.js";

const { width: DEVICE_WIDTH } = getDeviceInfo();

export { WIDGET_HEIGHT, TITLE_STYLE, TODAY_STYLE, NEXT_HOLIDAY_STYLE };

export const LINE_STYLE = {
  x: px(50),
  y: px(104),
  w: DEVICE_WIDTH - px(100),
  h: 2,
  color: 0x444444
};
