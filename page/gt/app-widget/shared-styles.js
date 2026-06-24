import ui from "@zos/ui";
import { getDeviceInfo } from "@zos/device";
import { px } from "@zos/utils";

const { width: DEVICE_WIDTH } = getDeviceInfo();

export const WIDGET_HEIGHT = 180;

export const TITLE_STYLE = {
  x: px(60),
  y: px(10),
  w: DEVICE_WIDTH - px(80),
  h: px(32),
  color: 0x888888,
  text_size: px(26),
  align_h: ui.align.LEFT,
  align_v: ui.align.CENTER_V
};

export const TODAY_STYLE = {
  x: px(60),
  y: px(46),
  w: DEVICE_WIDTH - px(80),
  h: px(52),
  color: 0x00bfff,
  text_size: px(38),
  align_h: ui.align.LEFT,
  align_v: ui.align.CENTER_V
};

export const NEXT_HOLIDAY_STYLE = {
  x: px(60),
  y: px(114),
  w: DEVICE_WIDTH - px(80),
  h: px(52),
  color: 0xffffff,
  text_size: px(34),
  align_h: ui.align.LEFT,
  align_v: ui.align.CENTER_V
};
