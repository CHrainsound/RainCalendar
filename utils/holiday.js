export function getHolidayTypeText(type) {
  const types = {
    traditional: "传统节日",
    international: "国际节日",
    statutory: "法定节假日",
    solarTerm: "节气"
  };
  return types[type] || type;
}

export function formatDate(dateStr) {
  const date = new Date(dateStr);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${month}月${day}日`;
}
