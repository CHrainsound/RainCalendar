import ui from "@zos/ui";
import { onDigitalCrown, offDigitalCrown, KEY_HOME } from "@zos/interaction";
import { CALENDAR_STYLE, INFO_STYLE, BTN_PREV_STYLE, BTN_NEXT_STYLE, CALENDAR_GRID_START_Y, OFFSET_LAST_ROW } from "zosLoader:./index.page.[pf].layout.js";
import { px } from "@zos/utils";
import { getText } from "@zos/i18n";
import { solarToLunar, getHolidaysForYear, formatDateKey } from "../shared/calendar.js";

const COLOR_HOLIDAY = 0xff4500;
const COLOR_WEEKEND = 0x888888;
const COLOR_WORKDAY = 0xffffff;
const COLOR_LUNAR = 0x666666;
const COLOR_TODAY = 0x00bfff;

const CELL_W = 62;
const CELL_H = 50;
const START_X = 240 - (CELL_W * 7) / 2 + 2;
const START_Y = CALENDAR_GRID_START_Y;

const WEEKDAY_KEYS = ["weekday_sun", "weekday_mon", "weekday_tue", "weekday_wed", "weekday_thu", "weekday_fri", "weekday_sat"];

Page({
  onInit() {
    this.currentYear = new Date().getFullYear();
    this.currentMonth = new Date().getMonth() + 1;
    this.refs = {};
    this.isAnimating = false;
    this.allHolidays = [];
    this.lunarCache = {};
    this.lunarCacheOrder = [];
    this.maxCacheSize = 12;
    this.holidayCache = {};
    this.holidayStartDates = {};
  },
  build() {
    this.createWidgets();
    this.enableCrown();
    this.buildAllHolidays();
    this.updateCalendar();
  },

  cleanLunarCache() {
    while (this.lunarCacheOrder.length > this.maxCacheSize) {
      const oldestKey = this.lunarCacheOrder.shift();
      delete this.lunarCache[oldestKey];
    }
  },

  buildAllHolidays() {
    this.allHolidays = [];
    this.holidayStartDates = {};
    
    const currentYear = new Date().getFullYear();
    for (let year = currentYear - 1; year <= currentYear + 1; year++) {
      if (!this.holidayCache[year]) {
        this.holidayCache[year] = getHolidaysForYear(year);
      }
      const yearData = this.holidayCache[year];
      
      const nameFirstDate = {};
      
      Object.keys(yearData).forEach(key => {
        const h = yearData[key];
        if (h && h.holiday && h.date) {
          const parts = h.date.split('-');
          const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
          if (!nameFirstDate[h.name] || d < nameFirstDate[h.name]) {
            nameFirstDate[h.name] = d;
          }
        }
      });
      
      Object.keys(nameFirstDate).forEach(name => {
        const d = nameFirstDate[name];
        const dateKey = `${d.getMonth() + 1}-${d.getDate()}`;
        this.holidayStartDates[`${d.getFullYear()}-${dateKey}`] = name;
        this.allHolidays.push({ date: d, name: name });
      });
    }
    
    this.allHolidays.sort((a, b) => a.date - b.date);
  },

  createWidgets() {
    this.refs.title = ui.createWidget(ui.widget.TEXT, CALENDAR_STYLE);
    
    WEEKDAY_KEYS.forEach((key, i) => {
      ui.createWidget(ui.widget.TEXT, {
        x: px(START_X + i * CELL_W), y: px(START_Y),
        w: px(CELL_W), h: px(CELL_H),
        color: 0x888888, text_size: px(22),
        align_h: ui.align.CENTER_H, align_v: ui.align.CENTER_V, text: getText(key)
      });
    });
    
    this.refs.days = [];
    this.refs.lunars = [];
    this.refs.holidays = [];
    for (let row = 0; row < 6; row++) {
      for (let col = 0; col < 7; col++) {
        this.refs.days.push(ui.createWidget(ui.widget.TEXT, {
          x: px(START_X + col * CELL_W),
          y: px(START_Y + (row + 1) * CELL_H),
          w: px(CELL_W), h: px(24),
          color: COLOR_WORKDAY, text_size: px(22),
          align_h: ui.align.CENTER_H, align_v: ui.align.CENTER_V, text: ""
        }));
        
        this.refs.lunars.push(ui.createWidget(ui.widget.TEXT, {
          x: px(START_X + col * CELL_W),
          y: px(START_Y + (row + 1) * CELL_H + 24),
          w: px(CELL_W), h: px(14),
          color: COLOR_LUNAR, text_size: px(12),
          align_h: ui.align.CENTER_H, align_v: ui.align.TOP, text: ""
        }));
        
        this.refs.holidays.push(ui.createWidget(ui.widget.TEXT, {
          x: px(START_X + col * CELL_W),
          y: px(START_Y + (row + 1) * CELL_H + 32),
          w: px(CELL_W), h: px(12),
          color: COLOR_HOLIDAY, text_size: px(10),
          align_h: ui.align.CENTER_H, align_v: ui.align.TOP, text: ""
        }));
      }
    }
    
    this.refs.info = ui.createWidget(ui.widget.TEXT, INFO_STYLE);
    
    const self = this;
    
    this.refs.btnPrev = ui.createWidget(ui.widget.BUTTON, {
      ...BTN_PREV_STYLE,
      click_func: function() {
        self.prevMonth();
      }
    });
    
    this.refs.btnNext = ui.createWidget(ui.widget.BUTTON, {
      ...BTN_NEXT_STYLE,
      click_func: function() {
        self.nextMonth();
      }
    });
  },

  updateCalendar() {
    const year = this.currentYear;
    const month = this.currentMonth;
    const now = new Date();
    const today = now.getDate();
    const isCurrentMonth = year === now.getFullYear() && month === now.getMonth() + 1;
    const firstDay = new Date(year, month - 1, 1).getDay();
    const daysInMonth = new Date(year, month, 0).getDate();
    
    const holidayMap = {};
    if (!this.holidayCache[year]) {
      this.holidayCache[year] = getHolidaysForYear(year);
    }
    const yearHolidays = this.holidayCache[year];
    Object.keys(yearHolidays).forEach(key => {
      const h = yearHolidays[key];
      if (h && h.date) {
        const d = new Date(h.date);
        if (d.getFullYear() === year && d.getMonth() + 1 === month) {
          holidayMap[d.getDate()] = h;
        }
      }
    });
    
    this.refs.title.setProperty(ui.prop.MORE, { text: `${year}/${String(month).padStart(2, '0')}` });
    
    const cacheKey = `${year}-${month}`;
    if (!this.lunarCache[cacheKey]) {
      this.lunarCache[cacheKey] = {};
      for (let d = 1; d <= daysInMonth; d++) {
        this.lunarCache[cacheKey][d] = solarToLunar(year, month, d);
      }
      this.lunarCacheOrder.push(cacheKey);
      this.cleanLunarCache();
    }
    
    let dayIndex = 0;
    let dayNum = 1;
    for (let row = 0; row < 6; row++) {
      for (let col = 0; col < 7; col++) {
        const dayRef = this.refs.days[dayIndex];
        const lunarRef = this.refs.lunars[dayIndex];
        const holRef = this.refs.holidays[dayIndex];
        
        const offsetX = (row === 5 && OFFSET_LAST_ROW) ? CELL_W : 0;
        const x = px(START_X + col * CELL_W + offsetX);
        
        if ((row === 0 && col < firstDay) || dayNum > daysInMonth) {
          dayRef.setProperty(ui.prop.MORE, { text: "", x: x });
          lunarRef.setProperty(ui.prop.MORE, { text: "", x: x });
          holRef.setProperty(ui.prop.MORE, { text: "", x: x });
        } else {
          const isToday = isCurrentMonth && dayNum === today;
          const dateKey = `${year}-${month}-${dayNum}`;
          const isFirstDay = this.holidayStartDates[dateKey];
          const isWeekend = col === 0 || col === 6;
          
          let color = COLOR_WORKDAY;
          let fontSize = px(22);
          if (isToday) {
            color = COLOR_TODAY;
            fontSize = px(30);
          } else if (isFirstDay) {
            color = COLOR_HOLIDAY;
          } else if (isWeekend) {
            color = COLOR_WEEKEND;
          }
          
          dayRef.setProperty(ui.prop.MORE, { text: String(dayNum), color: color, text_size: fontSize, x: x });
          
          const lunar = this.lunarCache[cacheKey][dayNum];
          let lunarText = lunar.isFirst ? getText(lunar.monthKey) : getText(lunar.dayKey);
          let lunarColor = COLOR_LUNAR;
          
          if (isFirstDay) {
            lunarText = getText(this.holidayStartDates[dateKey]);
            lunarColor = COLOR_HOLIDAY;
          }
          
          lunarRef.setProperty(ui.prop.MORE, { text: lunarText, color: lunarColor, x: x });
          holRef.setProperty(ui.prop.MORE, { text: "", color: COLOR_HOLIDAY, x: x });
          
          dayNum++;
        }
        dayIndex++;
      }
    }
    
    this.updateInfo(holidayMap, isCurrentMonth, today);
  },

  updateInfo(holidayMap, isCurrentMonth, today) {
    const todayHoliday = holidayMap[today];
    if (isCurrentMonth && todayHoliday && todayHoliday.holiday) {
      this.refs.info.setProperty(ui.prop.MORE, { text: getText("todayIs").replace("%s", getText(todayHoliday.name)) });
      return;
    }
    
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    
    for (const h of this.allHolidays) {
      if (h.date > now) {
        const diff = Math.ceil((h.date - now) / 86400000);
        this.refs.info.setProperty(ui.prop.MORE, { text: getText("nextHoliday").replace("%s", getText(h.name)).replace("%d", diff) });
        return;
      }
    }
    
    this.refs.info.setProperty(ui.prop.MORE, { text: getText("noHolidayData") });
  },

  enableCrown() {
    let locked = false;
    onDigitalCrown({
      callback: (key, degree) => {
        if (key !== KEY_HOME || locked) return;
        
        if (degree > 10) {
          locked = true;
          this.prevMonth();
          setTimeout(() => { locked = false; }, 300);
        } else if (degree < -10) {
          locked = true;
          this.nextMonth();
          setTimeout(() => { locked = false; }, 300);
        }
      }
    });
  },

  animate(updateFn) {
    if (this.isAnimating) return;
    this.isAnimating = true;
    let step = 0;
    const max = 3;
    
    const loop = () => {
      if (step <= max) {
        const c = this.lerp(0x333333, 0xffffff, step / max);
        this.refs.title.setProperty(ui.prop.MORE, { color: c });
        this.refs.info.setProperty(ui.prop.MORE, { color: c });
        step++;
        setTimeout(loop, 15);
      } else {
        updateFn();
        step = 0;
        const fadeIn = () => {
          if (step <= max) {
            const c = this.lerp(0x333333, 0xffffff, step / max);
            this.refs.title.setProperty(ui.prop.MORE, { color: c });
            this.refs.info.setProperty(ui.prop.MORE, { color: c });
            step++;
            setTimeout(fadeIn, 15);
          } else {
            this.isAnimating = false;
          }
        };
        fadeIn();
      }
    };
    
    this.refs.title.setProperty(ui.prop.MORE, { color: 0x333333 });
    this.refs.info.setProperty(ui.prop.MORE, { color: 0x333333 });
    loop();
  },

  lerp(a, b, t) {
    const r = (a >> 16) + Math.round(((b >> 16) - (a >> 16)) * t);
    const g = ((a >> 8) & 0xff) + Math.round((((b >> 8) & 0xff) - ((a >> 8) & 0xff)) * t);
    const bl = (a & 0xff) + Math.round(((b & 0xff) - (a & 0xff)) * t);
    return (r << 16) | (g << 8) | bl;
  },

  prevMonth() {
    this.currentMonth--;
    if (this.currentMonth < 1) { this.currentMonth = 12; this.currentYear--; }
    this.updateCalendar();
  },

  nextMonth() {
    this.currentMonth++;
    if (this.currentMonth > 12) { this.currentMonth = 1; this.currentYear++; }
    this.updateCalendar();
  },

  onDestroy() { offDigitalCrown(); }
});
