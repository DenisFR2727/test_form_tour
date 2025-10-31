// // # 🧪 Мок API (браузерні функції)

// // Це набір **браузерних функцій**, які повертають `Promise<Response>` (аналогічно до `fetch`).
// // Дані генеруються в пам'яті, без реального бекенду.

// // ## ✅ Публічні функції

// export function getCountries(): Promise<Response>;
// export function searchGeo(query?: string): Promise<Response>;
// export function startSearchPrices(countryID: string): Promise<Response>;
// export function getSearchPrices(token: string): Promise<Response>;
// export function stopSearchPrices(token: string): Promise<Response>;
// export function getHotels(countryID: string): Promise<Response>;
// export function getHotel(hotelId: number | string): Promise<Response>;
// export function getPrice(priceId: string): Promise<Response>;
// // ```

// // > Успішні сценарії повертають `Response` зі статусом `200`.
// // > Помилки повертаються через `Promise.reject(Response)` зі статусами `400/404/425`.

// // ---

// // ## 📦 Моделі даних (TypeScript-типи для зручності)

// // ```ts
// // // Базові сутності
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

// // Колекції у вигляді словників
// type CountriesMap = Record<string, Country>;
// type HotelsMap = Record<string, Hotel>;

// // Пошук цін (оффер)
// type PriceOffer = {
//   id: string; // UUID
//   amount: number; // 1500–4000
//   currency: "usd"; // нижній регістр за поточною реалізацією
//   startDate: string; // YYYY-MM-DD (сьогодні +2..5)
//   endDate: string; // YYYY-MM-DD (start +4..7)
//   hotelID?: string; // додається в результатах пошуку цін
// };

// // Відповідь пошуку цін (готові результати)
// type PricesMap = Record<string, PriceOffer>;

// // Підказки гео-пошуку
// type GeoEntity =
//   | (Country & { type: "country" })
//   | (City & { type: "city" })
//   | (Hotel & { type: "hotel" });

// type GeoResponse = Record<string, GeoEntity>;

// // Уніфікована помилка
// type ErrorResponse = {
//   code: number; // 400, 404, 425
//   error: true;
//   message: string;
//   waitUntil?: string; // ISO для 425
// };

// // Успішні спеціальні відповіді
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

// ### `getCountries(): Promise<Response>`
// Повертає словник країн.

// - **200 OK** → `CountriesMap`

// {
//   "115": { "id": "115", "name": "Туреччина", "flag": "https://flagcdn.com/w40/tr.png" },
//   "43":  { "id": "43",  "name": "Єгипет",    "flag": "https://flagcdn.com/w40/eg.png" },
//   "34":  { "id": "34",  "name": "Греція",    "flag": "https://flagcdn.com/w40/gr.png" }
// }

// ### `searchGeo(query?: string): Promise<Response>`
// Імітує підказки для країн/міст/готелів (набір залежить від довжини `query`).

// - **200 OK** → `GeoResponse`

// ```json
// {
//   "712":  { "id": 712,  "name": "Хургада", "type": "city" },
//   "7953": { "id": 7953, "name": "Marlin Inn Azur Resort", "type": "hotel" },
//   "115":  { "id": "115","name": "Туреччина", "type": "country" }
// }

// ### `startSearchPrices(countryID: string): Promise<Response>`
// Стартує пошук цін по країні.

// - **200 OK** → `StartSearchResponse`
// - **400 Bad Request** → `ErrorResponse` (якщо `countryID` не передано)

// 200
// { "token": "2f6f2b14-8f6e-4dc8-9a7a-9f86d0816a6e", "waitUntil": "2025-08-24T13:15:03.000Z" }

// // 400
// { "code": 400, "error": true, "message": "Country id is required param." }

//  `waitUntil` — ISO-час, коли можна викликати `getSearchPrices(token)`.

// ### `getSearchPrices(token: string): Promise<Response>`
// Повертає результати пошуку цін або статус «ще не готово».

// - **200 OK** → `GetSearchPricesResponse`
// - **404 Not Found** → `ErrorResponse` (якщо токен невідомий)
// - **425 Too Early** → `ErrorResponse` (ще не готово; містить `waitUntil`)

// 200
// {
//   "prices": {
//     "ff7e5e3a-1a5d-4f33-9e1a-8c55c0028eaf": {
//       "id": "ff7e5e3a-1a5d-4f33-9e1a-8c55c0028eaf",
//       "amount": 3275,
//       "currency": "usd",
//       "startDate": "2025-08-27",
//       "endDate": "2025-09-02",
//       "hotelID": "7953"
//     }
//   }
// }

// 404
// { "code": 404, "error": true, "message": "Search with this token was not found." }

// // 425
// {
//   "code": 425,
//   "error": true,
//   "message": "Search results are not ready yet. Please try again later.",
//   "waitUntil": "2025-08-24T13:15:03.000Z"
// }

// ### `stopSearchPrices(token: string): Promise<Response>`
// Скасовує активний пошук.

// - **200 OK** → `StopSearchResponse`
// - **404 Not Found** → `ErrorResponse` (невідомий токен)

// ```json
// // 200
// { "status": "cancelled", "message": "Search has been cancelled successfully." }

// // 404
// { "code": 404, "error": true, "message": "Search with this token was not found." }
// ```

// ---

// ### `getHotels(countryID: string): Promise<Response>`
// Повертає словник готелів у країні.

// - **200 OK** → `HotelsMap` (може бути порожнім `{}`)

// ```json
// {
//   "7953": {
//     "id": 7953,
//     "name": "Marlin Inn Azur Resort",
//     "img": "https://newimg.otpusk.com/2/400x300/00/03/97/88/3978846.webp",
//     "cityId": 712,
//     "cityName": "Хургада",
//     "countryId": "43",
//     "countryName": "Єгипет"
//   }
// }
// ```

// ---

// ### `getHotel(hotelId: number | string): Promise<Response>`
// Повертає деталі готелю.

// - **200 OK** → `Hotel`
// - **404 Not Found** → `ErrorResponse` (якщо не знайдено)

// ```json
// // 200
// {
//   "id": 7953,
//   "name": "Marlin Inn Azur Resort",
//   "img": "https://newimg.otpusk.com/2/400x300/00/03/97/88/3978846.webp",
//   "cityId": 712,
//   "cityName": "Хургада",
//   "countryId": "43",
//   "countryName": "Єгипет"
// }

// // 404
// { "code": 404, "error": true, "message": "Hotel with this ID was not found." }
// ```

// ---

// ### `getPrice(priceId: string): Promise<Response>`
// Повертає (згенеровану) ціну по конкретному `priceId`.

// - **200 OK** → `PriceOffer` (з підставленим `id = priceId`)
// - **404 Not Found** → `ErrorResponse` (якщо `priceId` не передано)

// ```json
// // 200
// {
//   "id": "c1d2f9c2-8e1e-45f3-9a11-1df4b5f1f7c3",
//   "amount": 2750,
//   "currency": "usd",
//   "startDate": "2025-08-28",
//   "endDate": "2025-09-03"
// }

// // 404
// { "code": 404, "error": true, "message": "Offer with this ID was not found." }
// ```

// > Наразі функція **не перевіряє існування** оффера — просто генерує під переданий `priceId`.
