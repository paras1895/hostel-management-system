// lib/mess.ts
export type DayKey =
  | "Monday"
  | "Tuesday"
  | "Wednesday"
  | "Thursday"
  | "Friday"
  | "Saturday"
  | "Sunday";

export type MealSlot = "breakfast" | "lunch" | "dinner";

export type DayMenu = Record<MealSlot, string[]>;
export type WeeklyMenu = Record<DayKey, DayMenu>;

// 🔧 EDIT the items below to your actual menu.
// Same menu repeats weekly on the same weekday.
export const WEEKLY_MENU: WeeklyMenu = {
  Monday: {
    breakfast: ["Poha", "Tea/Coffee", "Banana"],
    lunch: ["Rice", "Dal Fry", "Aloo Gobi", "Chapati", "Salad"],
    dinner: ["Jeera Rice", "Rajma", "Mix Veg", "Chapati", "Kheer"],
  },
  Tuesday: {
    breakfast: ["Idli", "Sambar", "Coconut Chutney", "Tea/Coffee"],
    lunch: ["Rice", "Dal Tadka", "Paneer Bhurji", "Chapati", "Salad"],
    dinner: ["Veg Pulao", "Chole", "Chapati", "Boondi Raita"],
  },
  Wednesday: {
    breakfast: ["Upma", "Tea/Coffee", "Fruit"],
    lunch: ["Rice", "Dal Makhani", "Bhindi Masala", "Chapati", "Salad"],
    dinner: ["Fried Rice", "Gobi Manchurian (dry)", "Soup", "Gulab Jamun"],
  },
  Thursday: {
    breakfast: ["Masala Dosa", "Sambar", "Chutney", "Tea/Coffee"],
    lunch: ["Jeera Rice", "Kadhi Pakora", "Aloo Matar", "Chapati", "Salad"],
    dinner: ["Rice", "Sambar", "Cabbage Poriyal", "Chapati", "Payasam"],
  },
  Friday: {
    breakfast: ["Paratha", "Curd", "Pickle", "Tea/Coffee"],
    lunch: ["Rice", "Dal Fry", "Veg Kofta", "Chapati", "Salad"],
    dinner: ["Veg Biryani", "Mirchi Ka Salan", "Raita", "Ice Cream"],
  },
  Saturday: {
    breakfast: ["Puri", "Bhaji", "Tea/Coffee"],
    lunch: ["Rice", "Dal", "Egg Curry / Veg Curry", "Chapati", "Salad"],
    dinner: ["Hakka Noodles", "Chilli Paneer (dry)", "Soup", "Custard"],
  },
  Sunday: {
    breakfast: ["Aloo Poha", "Tea/Coffee", "Fruit"],
    lunch: ["Jeera Rice", "Dal Tadka", "Paneer Butter Masala", "Chapati", "Salad"],
    dinner: ["Khichdi", "Kadhi", "Papad", "Halwa"],
  },
};

export function dayKeyFromDate(d: Date, tz = "Asia/Kolkata"): DayKey {
  const wd = d.toLocaleDateString("en-IN", { weekday: "long", timeZone: tz });
  // Type assertion is safe because toLocaleDateString returns one of the 7 long names.
  return wd as DayKey;
}

export function getMenuForDay(day: DayKey): DayMenu {
  return WEEKLY_MENU[day];
}

export function getTodayMenu(tz = "Asia/Kolkata"): { day: DayKey; menu: DayMenu } {
  const day = dayKeyFromDate(new Date(), tz);
  return { day, menu: WEEKLY_MENU[day] };
}
