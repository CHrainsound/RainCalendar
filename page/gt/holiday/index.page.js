import ui from "@zos/ui";
import { onDigitalCrown, offDigitalCrown, KEY_HOME } from "@zos/interaction";
import { CALENDAR_STYLE, INFO_STYLE, BTN_PREV_STYLE, BTN_NEXT_STYLE, CALENDAR_GRID_START_Y, OFFSET_LAST_ROW } from "zosLoader:./index.page.[pf].layout.js";
import { px } from "@zos/utils";

const COLOR_HOLIDAY = 0xff4500;
const COLOR_WEEKEND = 0x888888;
const COLOR_WORKDAY = 0xffffff;
const COLOR_LUNAR = 0x666666;
const COLOR_TODAY = 0x00bfff;

const LUNAR_YEAR_START = 1900;
const LUNAR_YEAR_END = 2100;
const LUNAR_BASE_DAY = 348;
const LEAP_MONTH_MASK = 0xf;
const LEAP_DAYS_MASK = 0x10000;
const MONTH_DAYS_BIT = 0x8000;

const LUNAR_INFO = [
  0x04bd8,0x04ae0,0x0a570,0x054d5,0x0d260,0x0d950,0x16554,0x056a0,0x09ad0,0x055d2,
  0x04ae0,0x0a5b6,0x0a4d0,0x0d250,0x1d255,0x0b540,0x0d6a0,0x0ada2,0x095b0,0x14977,
  0x04970,0x0a4b0,0x0b4b5,0x06a50,0x06d40,0x1ab54,0x02b60,0x09570,0x052f2,0x04970,
  0x06566,0x0d4a0,0x0ea50,0x06e95,0x05ad0,0x02b60,0x186e3,0x092e0,0x1c8d7,0x0c950,
  0x0d4a0,0x1d8a6,0x0b550,0x056a0,0x1a5b4,0x025d0,0x092d0,0x0d2b2,0x0a950,0x0b557,
  0x06ca0,0x0b550,0x15355,0x04da0,0x0a5b0,0x14573,0x052b0,0x0a9a8,0x0e950,0x06aa0,
  0x0aea6,0x0ab50,0x04b60,0x0aae4,0x0a570,0x05260,0x0f263,0x0d950,0x05b57,0x056a0,
  0x096d0,0x04dd5,0x04ad0,0x0a4d0,0x0d4d4,0x0d250,0x0d558,0x0b540,0x0b6a0,0x195a6,
  0x095b0,0x049b0,0x0a974,0x0a4b0,0x0b27a,0x06a50,0x06d40,0x0af46,0x0ab60,0x09570,
  0x04af5,0x04970,0x064b0,0x074a3,0x0ea50,0x06b58,0x055c0,0x0ab60,0x096d5,0x092e0,
  0x0c960,0x0d954,0x0d4a0,0x0da50,0x07552,0x056a0,0x0abb7,0x025d0,0x092d0,0x0cab5,
  0x0a950,0x0b4a0,0x0baa4,0x0ad50,0x055d9,0x04ba0,0x0a5b0,0x15176,0x052b0,0x0a930,
  0x07954,0x06aa0,0x0ad50,0x05b52,0x04b60,0x0a6e6,0x0a4e0,0x0d260,0x0ea65,0x0d530,
  0x05aa0,0x076a3,0x096d0,0x04afb,0x04ad0,0x0a4d0,0x1d0b6,0x0d250,0x0d520,0x0dd45,
  0x0b5a0,0x056d0,0x055b2,0x049b0,0x0a577,0x0a4b0,0x0aa50,0x1b255,0x06d20,0x0ada0,
  0x14b63,0x09370,0x049f8,0x04970,0x064b0,0x168a6,0x0ea50,0x06b20,0x1a6c4,0x0aae0,
  0x0a2e0,0x0d2e3,0x0c960,0x0d557,0x0d4a0,0x0da50,0x05d55,0x056a0,0x0a6d0,0x055d4,
  0x052d0,0x0a9b8,0x0a950,0x0b4a0,0x0b6a6,0x0ad50,0x055a0,0x0aba4,0x0a5b0,0x052b0,
  0x0b273,0x06930,0x07337,0x06aa0,0x0ad50,0x14b55,0x04b60,0x0a570,0x054e4,0x0d160,
  0x0e968,0x0d520,0x0daa0,0x16aa6,0x056d0,0x04ae0,0x0a9d4,0x0a2d0,0x0d150,0x0f252,
  0x0d520
];

const LUNAR_MONTHS_CN = ["正月","二月","三月","四月","五月","六月","七月","八月","九月","十月","冬月","腊月"];
const LUNAR_DAYS_CN = ["初一","初二","初三","初四","初五","初六","初七","初八","初九","初十",
  "十一","十二","十三","十四","十五","十六","十七","十八","十九","二十",
  "廿一","廿二","廿三","廿四","廿五","廿六","廿七","廿八","廿九","三十"];

function lunarYearDays(year) {
  const yearIndex = year - LUNAR_YEAR_START;
  let sum = LUNAR_BASE_DAY;
  for (let i = MONTH_DAYS_BIT; i > 0x8; i >>= 1) {
    sum += (LUNAR_INFO[yearIndex] & i) !== 0 ? 1 : 0;
  }
  const leapMonth = LUNAR_INFO[yearIndex] & LEAP_MONTH_MASK;
  if (leapMonth) {
    sum += (LUNAR_INFO[yearIndex] & LEAP_DAYS_MASK) !== 0 ? 30 : 29;
  }
  return sum;
}

function monthDays(year, month) {
  const yearIndex = year - LUNAR_YEAR_START;
  return (LUNAR_INFO[yearIndex] & (LEAP_DAYS_MASK >> month)) === 0 ? 29 : 30;
}

function solarToLunar(year, month, day) {
  let offset = Math.floor((Date.UTC(year, month - 1, day) - Date.UTC(LUNAR_YEAR_START, 0, 31)) / 86400000);
  let temp = 0;
  let lunarYear = LUNAR_YEAR_START;
  
  for (; lunarYear < LUNAR_YEAR_END && offset > 0; lunarYear++) {
    temp = lunarYearDays(lunarYear);
    offset -= temp;
  }
  
  if (offset < 0) {
    offset += temp;
    lunarYear--;
  }
  
  const yearIndex = lunarYear - LUNAR_YEAR_START;
  const leapMonth = LUNAR_INFO[yearIndex] & LEAP_MONTH_MASK;
  let lunarMonth = 1;
  let isLeap = false;
  
  for (let i = 1; i <= 12 && offset >= 0; i++) {
    if (leapMonth > 0 && i === leapMonth + 1 && !isLeap) {
      i--;
      isLeap = true;
      temp = (LUNAR_INFO[yearIndex] & LEAP_DAYS_MASK) !== 0 ? 30 : 29;
    } else {
      temp = monthDays(lunarYear, i);
    }
    
    if (isLeap && i === leapMonth + 1) isLeap = false;
    offset -= temp;
    if (!isLeap) lunarMonth++;
  }
  
  if (offset < 0) {
    offset += temp;
    lunarMonth--;
  }
  
  const lunarDay = offset + 1;
  const monthIndex = lunarMonth - 1;
  
  return {
    month: monthIndex,
    day: lunarDay,
    isFirst: lunarDay === 1,
    monthText: LUNAR_MONTHS_CN[monthIndex],
    dayText: LUNAR_DAYS_CN[lunarDay - 1]
  };
}

function lunarToSolar(lunarYear, lunarMonth, lunarDay) {
  let offset = 0;
  
  for (let i = LUNAR_YEAR_START; i < lunarYear; i++) {
    offset += lunarYearDays(i);
  }
  
  const yearIndex = lunarYear - LUNAR_YEAR_START;
  const leapMonth = LUNAR_INFO[yearIndex] & LEAP_MONTH_MASK;
  for (let i = 1; i < lunarMonth; i++) {
    offset += monthDays(lunarYear, i);
    if (i === leapMonth) {
      offset += (LUNAR_INFO[yearIndex] & LEAP_DAYS_MASK) !== 0 ? 30 : 29;
    }
  }
  
  offset += lunarDay - 1;
  
  const baseDate = new Date(LUNAR_YEAR_START, 0, 31);
  const resultDate = new Date(baseDate.getTime() + offset * 86400000);
  
  return {
    year: resultDate.getFullYear(),
    month: resultDate.getMonth() + 1,
    day: resultDate.getDate()
  };
}

function formatDateKey(year, month, day) {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

const SOLAR_HOLIDAYS = [
  { month: 1, day: 1, name: "元旦" },
  { month: 5, day: 1, name: "劳动节" },
  { month: 10, day: 1, name: "国庆节" }
];

const LUNAR_HOLIDAYS = [
  { month: 1, day: 1, name: "春节" },
  { month: 1, day: 15, name: "元宵" },
  { month: 5, day: 5, name: "端午" },
  { month: 8, day: 15, name: "中秋" },
  { month: 9, day: 9, name: "重阳" },
  { month: 12, day: 30, name: "除夕" }
];

const SOLAR_TERMS = [
  { month: 1, name: "小寒", c: 5.37 },
  { month: 1, name: "大寒", c: 20.12 },
  { month: 2, name: "立春", c: 3.87 },
  { month: 2, name: "雨水", c: 18.73 },
  { month: 3, name: "惊蛰", c: 5.63 },
  { month: 3, name: "春分", c: 20.646 },
  { month: 4, name: "清明", c: 4.81 },
  { month: 4, name: "谷雨", c: 20.1 },
  { month: 5, name: "立夏", c: 5.52 },
  { month: 5, name: "小满", c: 21.04 },
  { month: 6, name: "芒种", c: 5.678 },
  { month: 6, name: "夏至", c: 21.37 },
  { month: 7, name: "小暑", c: 7.108 },
  { month: 7, name: "大暑", c: 22.83 },
  { month: 8, name: "立秋", c: 7.5 },
  { month: 8, name: "处暑", c: 23.13 },
  { month: 9, name: "白露", c: 7.646 },
  { month: 9, name: "秋分", c: 23.042 },
  { month: 10, name: "寒露", c: 8.318 },
  { month: 10, name: "霜降", c: 23.438 },
  { month: 11, name: "立冬", c: 7.438 },
  { month: 11, name: "小雪", c: 22.36 },
  { month: 12, name: "大雪", c: 7.18 },
  { month: 12, name: "冬至", c: 21.94 }
];

function getSolarTermDay(year, c) {
  const Y = year % 100;
  const D = 0.2422;
  const L = Math.floor(Y / 4);
  return Math.floor(Y * D + c) - L;
}

function getNthSunday(year, month, n) {
  const firstDay = new Date(year, month - 1, 1);
  const firstSunday = firstDay.getDay() === 0 ? 1 : 8 - firstDay.getDay();
  return firstSunday + (n - 1) * 7;
}

const SPECIAL_HOLIDAYS = [
  { month: 5, name: "母亲节", nth: 2 },
  { month: 6, name: "父亲节", nth: 3 }
];

const INTERNATIONAL_HOLIDAYS = [
  { month: 1, day: 10, name: "警察节" },
  { month: 2, day: 14, name: "情人节" },
  { month: 3, day: 8, name: "妇女节" },
  { month: 3, day: 12, name: "植树节" },
  { month: 3, day: 15, name: "消费者权益日" },
  { month: 4, day: 1, name: "愚人节" },
  { month: 4, day: 22, name: "地球日" },
  { month: 5, day: 4, name: "青年节" },
  { month: 5, day: 12, name: "护士节" },
  { month: 6, day: 1, name: "儿童节" },
  { month: 7, day: 1, name: "建党节" },
  { month: 8, day: 1, name: "建军节" },
  { month: 9, day: 10, name: "教师节" },
  { month: 10, day: 31, name: "万圣节" },
  { month: 11, day: 11, name: "光棍节" },
  { month: 12, day: 24, name: "平安夜" },
  { month: 12, day: 25, name: "圣诞节" }
];

function getHolidaysForYear(year) {
  const holidays = {};
  
  SOLAR_TERMS.forEach(h => {
    const day = getSolarTermDay(year, h.c);
    const key = formatDateKey(year, h.month, day);
    holidays[key] = { holiday: true, name: h.name, date: formatDateKey(year, h.month, day) };
  });
  
  SOLAR_HOLIDAYS.forEach(h => {
    const key = formatDateKey(year, h.month, h.day);
    holidays[key] = { holiday: true, name: h.name, date: formatDateKey(year, h.month, h.day) };
  });
  
  INTERNATIONAL_HOLIDAYS.forEach(h => {
    const key = formatDateKey(year, h.month, h.day);
    holidays[key] = { holiday: true, name: h.name, date: formatDateKey(year, h.month, h.day) };
  });
  
  SPECIAL_HOLIDAYS.forEach(h => {
    const day = getNthSunday(year, h.month, h.nth);
    const key = formatDateKey(year, h.month, day);
    holidays[key] = { holiday: true, name: h.name, date: formatDateKey(year, h.month, day) };
  });
  
  LUNAR_HOLIDAYS.forEach(h => {
    const solarDate = lunarToSolar(year, h.month, h.day);
    if (solarDate) {
      const key = formatDateKey(year, solarDate.month, solarDate.day);
      holidays[key] = { holiday: true, name: h.name, date: formatDateKey(year, solarDate.month, solarDate.day) };
    }
  });
  
  return holidays;
}

const CELL_W = 62;
const CELL_H = 50;
const START_X = 240 - (CELL_W * 7) / 2 + 2;
const START_Y = CALENDAR_GRID_START_Y;

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
          const d = new Date(h.date);
          if (!nameFirstDate[h.name] || d < nameFirstDate[h.name]) {
            nameFirstDate[h.name] = d;
          }
        }
      });
      
      Object.keys(nameFirstDate).forEach(name => {
        const d = nameFirstDate[name];
        const dateKey = `${d.getMonth() + 1}-${d.getDate()}`;
        this.holidayStartDates[`${year}-${dateKey}`] = name;
        this.allHolidays.push({ date: d, name: name });
      });
    }
    
    this.allHolidays.sort((a, b) => a.date - b.date);
  },

  createWidgets() {
    this.refs.title = ui.createWidget(ui.widget.TEXT, CALENDAR_STYLE);
    
    const weekDays = ["日", "一", "二", "三", "四", "五", "六"];
    
    weekDays.forEach((day, i) => {
      ui.createWidget(ui.widget.TEXT, {
        x: px(START_X + i * CELL_W), y: px(START_Y),
        w: px(CELL_W), h: px(CELL_H),
        color: 0x888888, text_size: px(22),
        align_h: ui.align.CENTER_H, align_v: ui.align.CENTER_V, text: day
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
    
    this.refs.title.setProperty(ui.prop.MORE, { text: `${year}年${month}月` });
    
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
          let lunarText = lunar.isFirst ? lunar.monthText : lunar.dayText;
          let lunarColor = COLOR_LUNAR;
          
          if (isFirstDay) {
            lunarText = this.holidayStartDates[dateKey];
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
      this.refs.info.setProperty(ui.prop.MORE, { text: `今天：${todayHoliday.name}` });
      return;
    }
    
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    
    for (const h of this.allHolidays) {
      if (h.date > now) {
        const diff = Math.ceil((h.date - now) / 86400000);
        this.refs.info.setProperty(ui.prop.MORE, { text: `下一个：${h.name}\n还有${diff}天` });
        return;
      }
    }
    
    this.refs.info.setProperty(ui.prop.MORE, { text: "暂无节假日数据" });
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
