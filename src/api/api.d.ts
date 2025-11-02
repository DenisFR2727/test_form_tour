export function getCountries(): Promise<Response>;
export function searchGeo(query?: string): Promise<Response>;
export function getHotels(countryID: string): Promise<Response>;
export function getHotel(hotelId: number | string): Promise<Response>;
export function getPrice(priceId: string): Promise<Response>;
export function startSearchPrices(countryID: string): Promise<Response>;
export function getSearchPrices(token: string): Promise<Response>;
export function stopSearchPrices(token: string): Promise<Response>;

export type Country = { id: string; name: string; flag: string };
export type City = { id: number; name: string; countryId?: string };
export type Hotel = {
  id: number;
  name: string;
  img: string;
  cityId: number;
  cityName: string;
  countryId: string;
  countryName: string;
};
// Колекції у вигляді словників
type CountriesMap = Record<string, Country>;
type HotelsMap = Record<string, Hotel>;

// Пошук цін (оффер)
export type PriceOffer = {
  id: string; // UUID
  amount: number; // 1500–4000
  currency: "usd"; // нижній регістр за поточною реалізацією
  startDate: string; // YYYY-MM-DD (сьогодні +2..5)
  endDate: string; // YYYY-MM-DD (start +4..7)
  hotelID?: string; // додається в результатах пошуку цін
};
// Відповідь пошуку цін (готові результати)
export type PricesMap = Record<string, PriceOffer>;

export type GeoEntity =
  | (Country & { type: "country" })
  | (City & { type: "city" })
  | (Hotel & { type: "hotel" });

export type GeoResponse = Record<string, GeoEntity>;

// Уніфікована помилка
type ErrorResponse = {
  code: number; // 400, 404, 425
  error: true;
  message: string;
  waitUntil?: string; // ISO для 425
};

// Успішні спеціальні відповіді
type StartSearchResponse = {
  token: string;
  waitUntil: string; // ISO коли можна питати результати
};

type GetSearchPricesResponse = {
  prices: PricesMap;
};

type StopSearchResponse = {
  status: "cancelled";
  message: string;
};
export type SearchPricesAPIResponse =
  | { status: "inProgress"; waitUntil: string }
  | { status: "done"; results: PricesMap }
  | { prices: PricesMap }
  | ErrorResponse;
