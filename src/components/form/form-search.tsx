import { useCallback } from "react";
import {
  getCountries,
  searchGeo,
  GeoEntity,
  Country,
  GeoResponse,
  getSearchPrices,
  startSearchPrices,
  PriceOffer,
} from "../../api/api";
import DropdownList from "../dropdown/dropdown";

import "./form.scss";
import { useAppDispatch, useAppSelector } from "../../hooks/hooks";
import useFetchTours from "./hooks";
import {
  setError,
  setLoading,
  setOpen,
  setQuery,
  setResults,
  setSelected,
  setTours,
} from "./tourSlice";

export default function TourSearchForm() {
  const dispatch = useAppDispatch();
  const loading = useAppSelector((state) => state.loading);
  const selected = useAppSelector((state) => state.selected);
  const results = useAppSelector((state) => state.results);
  const tours = useAppSelector((state) => state.tours);

  const { query, open, handleSelect } = useFetchTours();

  // --- Сабміт форми ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected?.id) return;

    dispatch(setError(null));
    dispatch(setTours([]));
    dispatch(setLoading(true));

    try {
      const res = await startSearchPrices(String(selected?.id));
      const json = await res.json();
      const { token, waitUntil } = json.data ? json.data : json;
      const delay = new Date(waitUntil).getTime() - Date.now();

      console.log("✅ Token отримано:", token, "⏳ Затримка:", delay);

      console.log("🧠 startSearchPrices response:", json);

      await fetchSearchResults(token, delay);
      console.log(tours);
    } catch (error) {
      console.error("❌ Помилка startSearchPrices:", error);
      dispatch(setError("Не вдалося запустити пошук турів."));
    } finally {
      dispatch(setLoading(false));
    }
  };

  const fetchSearchResults = useCallback(
    async (token: string, delay: number) => {
      console.log(`⏳ Очікування ${delay}ms перед getSearchPrices...`);

      await new Promise((resolve) => setTimeout(resolve, Math.max(0, delay)));
      // sss
      let attempt = 0;
      while (attempt < 10) {
        attempt++;
        try {
          const res = await getSearchPrices(token);
          const data = await res.json();

          console.log(`📡 getSearchPrices (${attempt}):`, data);

          // 🟢 Випадок 1: статус "inProgress"
          if (data.status === "inProgress") {
            const wait = new Date(data.waitUntil).getTime() - Date.now();
            console.log(`⏳ Пошук триває, чекаємо ${wait}ms...`);
            await new Promise((r) => setTimeout(r, Math.max(0, wait)));
            continue;
          }

          // 🟢 Випадок 2: статус "done"
          if (data.status === "done" && data.results) {
            console.log("✅ Готові тури:", data.results);
            dispatch(setTours(data.results));
            break;
          }

          // 🟢 Випадок 3: API повертає просто prices
          if (data.prices && typeof data.prices === "object") {
            console.log("✅ Отримано ціни:", data.prices);

            const resultsArray: PriceOffer[] = Object.entries(data.prices).map(
              ([key, value]) => ({ ...(value as PriceOffer), id: key })
            );
            dispatch(setTours(resultsArray));
            dispatch(setTours(resultsArray));
            break;
          }

          // ⚠️ Якщо нічого не збіглося
          console.warn("⚠️ Невідомий формат відповіді:", data);
          break;
        } catch (error) {
          console.error(`Помилка getSearchPrices (спроба ${attempt}):`, error);
          await new Promise((r) => setTimeout(r, 2000));
        }
      }
    },
    [dispatch]
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // --- Клік (фокус) на інпут ---
  const handleFocus = async () => {
    dispatch(setOpen(true));

    // Якщо нічого не введено — показати список країн
    if (!query) {
      dispatch(setSelected(null));

      try {
        dispatch(setLoading(true));
        const res = await getCountries();
        const data: Record<string, Country> = await res.json();
        const countries: GeoEntity[] = Object.values(data).map((country) => ({
          ...country,
          type: "country",
        }));
        dispatch(setResults(countries));
      } catch (error) {
        console.error("Помилка getCountries:", error);
      } finally {
        dispatch(setLoading(false));
      }
      return;
    }

    // Якщо вже є вибір
    if (selected) {
      if (selected.type === "country") {
        // Якщо вибрана країна — показати всі країни
        try {
          dispatch(setLoading(true));
          const res = await getCountries();
          const data: Record<string, Country> = await res.json();
          const countries: GeoEntity[] = Object.values(data).map((country) => ({
            ...country,
            type: "country",
          }));
          dispatch(setResults(countries));
        } catch (error) {
          console.error("Помилка getCountries:", error);
        } finally {
          dispatch(setLoading(false));
        }
      } else {
        // Якщо вибране місто або готель — пошукати за текстом у полі
        try {
          dispatch(setLoading(true));
          const res = await searchGeo(query);
          const data: GeoResponse = await res.json();
          dispatch(setResults(Object.values(data)));
        } catch (error) {
          console.error("Помилка searchGeo:", error);
        } finally {
          dispatch(setLoading(false));
        }
      }
    } else {
      // Якщо просто введений текст без вибору
      try {
        dispatch(setLoading(true));
        const res = await searchGeo(query);
        const data: GeoResponse = await res.json();
        dispatch(setResults(Object.values(data)));
      } catch (error) {
        console.error("Помилка searchGeo:", error);
      } finally {
        dispatch(setLoading(false));
      }
    }
  };
  return (
    <form onSubmit={handleSubmit} className="tour_search">
      <h2 className="tour_search-title">Форма пошуку турів</h2>
      <div className="input-wrapper">
        <input
          value={query}
          onChange={(e) => {
            dispatch(setQuery(e.target.value));
            dispatch(setSelected(null));
          }}
          onFocus={() => {
            dispatch(setOpen(true));
            handleFocus();
          }}
          onKeyDown={handleKeyDown}
        />
        <div id="overlay-dropdown"></div>
        {open && (
          <DropdownList
            handleSelect={handleSelect}
            loading={loading}
            results={results}
          />
        )}
      </div>

      <button type="submit">Знайти</button>
    </form>
  );
}
