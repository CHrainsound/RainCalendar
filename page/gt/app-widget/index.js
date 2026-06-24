import ui from "@zos/ui";
import { push } from "@zos/router";
import { getText } from "@zos/i18n";
import { setAppWidgetSize } from "@zos/ui";
import { solarToLunar, getHolidaysForYear, formatDateKey, LUNAR_MONTHS, LUNAR_DAYS } from "../shared/calendar.js";
import { TITLE_STYLE, TODAY_STYLE, LINE_STYLE, NEXT_HOLIDAY_STYLE, WIDGET_HEIGHT } from "zosLoader:./index.[pf].layout.js";

AppWidget({
  onInit() {
    this.refs = {};
    this.holidayCache = {};
  },

  build() {
    try {
      setAppWidgetSize({ h: WIDGET_HEIGHT });
      
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth() + 1;
      const day = now.getDate();
      
      const todayText = this.getTodayText(year, month, day);
      const nextText = this.getNextHolidayText(year, month, day);
      
      const clickFunc = () => {
        push({ url: "page/gt/holiday/index.page" });
      };
      
      this.refs.title = ui.createWidget(ui.widget.TEXT, {
        ...TITLE_STYLE,
        text: getText("widget_today"),
        click_func: clickFunc
      });
      
      this.refs.today = ui.createWidget(ui.widget.TEXT, {
        ...TODAY_STYLE,
        text: todayText,
        click_func: clickFunc
      });
      
      this.refs.line = ui.createWidget(ui.widget.FILL_RECT, {
        ...LINE_STYLE
      });
      
      this.refs.next = ui.createWidget(ui.widget.TEXT, {
        ...NEXT_HOLIDAY_STYLE,
        text: nextText,
        click_func: clickFunc
      });
    } catch (e) {
      console.log("AppWidget build error:", e);
    }
  },

  getTodayText(year, month, day) {
    const lunar = solarToLunar(year, month, day);
    
    if (!this.holidayCache[year]) {
      this.holidayCache[year] = getHolidaysForYear(year);
    }
    const dateKey = formatDateKey(year, month, day);
    const todayHoliday = this.holidayCache[year][dateKey];
    
    if (todayHoliday && todayHoliday.name) {
      return getText(todayHoliday.name);
    }
    
    const monthName = getText(LUNAR_MONTHS[lunar.month]);
    const dayName = getText(LUNAR_DAYS[lunar.day - 1]);
    return monthName + dayName;
  },

  getNextHolidayText(year, month, day) {
    const allHolidays = [];
    
    for (let y = year; y <= year + 1; y++) {
      if (!this.holidayCache[y]) {
        this.holidayCache[y] = getHolidaysForYear(y);
      }
      const yearData = this.holidayCache[y];
      Object.keys(yearData).forEach(key => {
        const h = yearData[key];
        if (h && h.holiday && h.date) {
          const parts = h.date.split('-');
          const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
          allHolidays.push({ date: d, name: h.name });
        }
      });
    }
    
    allHolidays.sort((a, b) => a.date - b.date);
    
    const now = new Date(year, month - 1, day);
    now.setHours(0, 0, 0, 0);
    
    for (const h of allHolidays) {
      if (h.date > now) {
        const diff = Math.ceil((h.date - now) / 86400000);
        const name = getText(h.name);
        return getText("widget_next_holiday").replace("%s", name).replace("%d", diff);
      }
    }
    
    return getText("widget_no_data");
  },

  onResume() {
    try {
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth() + 1;
      const day = now.getDate();
      
      if (this.refs.today) {
        this.refs.today.setProperty(ui.prop.MORE, { text: this.getTodayText(year, month, day) });
      }
      if (this.refs.next) {
        this.refs.next.setProperty(ui.prop.MORE, { text: this.getNextHolidayText(year, month, day) });
      }
    } catch (e) {
      console.log("AppWidget onResume error:", e);
    }
  },

  onPause() {},

  onDestroy() {}
});
