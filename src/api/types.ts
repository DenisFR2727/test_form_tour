// # 🧪 Мок API (браузерні функції)

// Це набір **браузерних функцій**, які повертають `Promise<Response>` (аналогічно до `fetch`).
// Дані генеруються в пам'яті, без реального бекенду.

// ## ✅ Публічні функції

// function getCountries(): Promise<Response>;
// function searchGeo(query?: string): Promise<Response>;
// function startSearchPrices(countryID: string): Promise<Response>;
// function getSearchPrices(token: string): Promise<Response>;
// function stopSearchPrices(token: string): Promise<Response>;
// function getHotels(countryID: string): Promise<Response>;
// function getHotel(hotelId: number | string): Promise<Response>;
// function getPrice(priceId: string): Promise<Response>;
// // ```

// > Успішні сценарії повертають `Response` зі статусом `200`.
// > Помилки повертаються через `Promise.reject(Response)` зі статусами `400/404/425`.

// ---

// ## 📦 Моделі даних (TypeScript-типи для зручності)

// ```ts
// // Базові сутності
// type Country = { id: string; name: string; flag: string };
// type City = { id: number; name: string };
// type Hotel = {
//   id: number;
//   name: string;
//   img: string;
//   cityId: number;
//   cityName: string;
//   countryId: string;
//   countryName: string;
// };

// Колекції у вигляді словників
// type CountriesMap = Record<string, Country>;
// type HotelsMap = Record<string, Hotel>;

// Пошук цін (оффер)
// type PriceOffer = {
//   id: string; // UUID
//   amount: number; // 1500–4000
//   currency: "usd"; // нижній регістр за поточною реалізацією
//   startDate: string; // YYYY-MM-DD (сьогодні +2..5)
//   endDate: string; // YYYY-MM-DD (start +4..7)
//   hotelID?: string; // додається в результатах пошуку цін
// };

// Відповідь пошуку цін (готові результати)
// type PricesMap = Record<string, PriceOffer>;

// Підказки гео-пошуку
// type GeoEntity =
//   | (Country & { type: "country" })
//   | (City & { type: "city" })
//   | (Hotel & { type: "hotel" });

// type GeoResponse = Record<string, GeoEntity>;

// Уніфікована помилка
// type ErrorResponse = {
//   code: number; // 400, 404, 425
//   error: true;
//   message: string;
//   waitUntil?: string; // ISO для 425
// };

// Успішні спеціальні відповіді
// type StartSearchResponse = {
//   token: string;
//   waitUntil: string; // ISO коли можна питати результати
// };

// type GetSearchPricesResponse = {
//   prices: PricesMap;
// };

// type StopSearchResponse = {
//   status: "cancelled";
//   message: string;
// };
