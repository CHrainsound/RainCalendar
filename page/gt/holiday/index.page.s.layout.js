import ui from "@zos/ui";
import { getDeviceInfo } from "@zos/device";
import { px } from "@zos/utils";

export const { width: DEVICE_WIDTH } = getDeviceInfo();

export const CALENDAR_STYLE = {
  x: px(60),
  y: px(50),
  w: DEVICE_WIDTH - px(120),
  h: px(50),
  color: 0xffffff,
  text_size: px(30),
  align_h: ui.align.CENTER_H,
  align_v: ui.align.CENTER_V
};

export const BTN_PREV_STYLE = {
  x: px(45),
  y: px(50),
  w: px(50),
  h: px(50),
  radius: px(25),
  normal_color: 0x333333,
  press_color: 0x555555,
  text: "<",
  color: 0xffffff,
  text_size: px(24)
};

export const BTN_NEXT_STYLE = {
  x: DEVICE_WIDTH - px(95),
  y: px(50),
  w: px(50),
  h: px(50),
  radius: px(25),
  normal_color: 0x333333,
  press_color: 0x555555,
  text: ">",
  color: 0xffffff,
  text_size: px(24)
};

export const INFO_STYLE = {
  x: px(0),
  y: px(410),
  w: DEVICE_WIDTH,
  h: px(70),
  color: 0xffffff,
  text_size: px(22),
  align_h: ui.align.CENTER_H,
  align_v: ui.align.CENTER_V,
  text_style: 2
};
