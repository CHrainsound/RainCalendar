import * as hmUI from "@zos/ui";
import { log as Logger } from "@zos/utils";
import { getText } from "@zos/i18n";
import { push } from "@zos/router";
import { BUTTON_STYLE } from "zosLoader:./index.page.[pf].layout.js";

const logger = Logger.getLogger("helloworld");
Page({
  onInit() {
    logger.debug("page onInit invoked");
  },
  build() {
    logger.debug("page build invoked");
    hmUI.createWidget(hmUI.widget.BUTTON, {
      ...BUTTON_STYLE,
      click_func: () => {
        push({ url: "page/gt/holiday/index.page" });
      }
    });
  },
  onDestroy() {
    logger.debug("page onDestroy invoked");
  }
});
