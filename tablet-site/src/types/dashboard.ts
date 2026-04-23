export type HouseholdMetric = {
  id: number;
  label: string;
  value: string;
};

export type Meal = {
  title: string;
  mealType: string;
  servings: number;
  source: string;
  image: string;
};

export type Weather = {
  location: string;
  tempC: number;
  condition: string;
  highC: number;
  lowC: number;
  rainChance: number;
  updatedAt: string;
};

export type CalendarEvent = {
  id: number;
  title: string;
  start: string;
  end?: string;
  location?: string;
  type?: string;
  source?: string;
};

export type DashboardNow = {
  time: string;
  dateLabel: string;
};

export type DashboardData = {
  now: DashboardNow;
  weather: Weather;
  meal: Meal;
  eventsToday: CalendarEvent[];
  upcoming: CalendarEvent[];
  household: HouseholdMetric[];
};