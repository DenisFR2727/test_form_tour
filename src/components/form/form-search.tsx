import {
  getCountries,
  searchGeo,
  GeoEntity,
  Country,
  GeoResponse,
  startSearchPrices,
} from "../../api/api";
import DropdownList from "../dropdown/dropdown";

import "./form.scss";
import { useAppDispatch, useAppSelector } from "../../hooks/hooks";
import useFetchTours, { useFetchSearchResults } from "./hooks";
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
  const error = useAppSelector((state) => state.error);

  const { query, open, handleSelect } = useFetchTours();
  const { fetchSearchResults } = useFetchSearchResults();

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

      await fetchSearchResults(token, delay, 2);
      console.log(tours);
      console.log(results);
    } catch (error: unknown) {
      let message = "Не вдалося запустити пошук турів.";
      if (error instanceof Error) message = error.message;
      dispatch(setError(message));
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // --- Клік (фокус) на інпут ---
  //   const handleFocus = async () => {
  //     dispatch(setOpen(true));

  //     // Якщо нічого не введено — показати список країн
  //     if (!query) {
  //       dispatch(setSelected(null));

  //       try {
  //         dispatch(setLoading(true));
  //         const res = await getCountries();
  //         const data: Record<string, Country> = await res.json();
  //         const countries: GeoEntity[] = Object.values(data).map((country) => ({
  //           ...country,
  //           type: "country",
  //         }));
  //         dispatch(setResults(countries));
  //       } catch (error: unknown) {
  //         let message = "Error Countries:";
  //         if (error instanceof Error) message = error.message;
  //         dispatch(setError(message));
  //       } finally {
  //         dispatch(setLoading(false));
  //       }
  //       return;
  //     }

  //     // Якщо вже є вибір
  //     if (selected) {
  //       if (selected.type === "country") {
  //         // Якщо вибрана країна — показати всі країни
  //         try {
  //           dispatch(setLoading(true));
  //           const res = await getCountries();
  //           const data: Record<string, Country> = await res.json();
  //           const countries: GeoEntity[] = Object.values(data).map((country) => ({
  //             ...country,
  //             type: "country",
  //           }));
  //           dispatch(setResults(countries));
  //         } catch (error: unknown) {
  //           let message = "Error Countries:";
  //           if (error instanceof Error) message = error.message;
  //           dispatch(setError(message));
  //         } finally {
  //           dispatch(setLoading(false));
  //         }
  //       } else {
  //         // Якщо вибране місто або готель — пошукати за текстом у полі
  //         try {
  //           dispatch(setLoading(true));
  //           const res = await searchGeo(query);

  //           const data: GeoResponse = await res.json();

  //           dispatch(setResults(Object.values(data)));
  //         } catch (error: unknown) {
  //           let message = "Error searchGeo";

  //           if (error instanceof Error) message = error.message;

  //           dispatch(setError(message));
  //         } finally {
  //           dispatch(setLoading(false));
  //         }
  //       }
  //     } else {
  //       // Якщо просто введений текст без вибору
  //       try {
  //         dispatch(setLoading(true));
  //         const res = await searchGeo(query);
  //         const data: GeoResponse = await res.json();
  //         dispatch(setResults(Object.values(data)));
  //       } catch (error) {
  //         console.error("Помилка searchGeo:", error);
  //       } finally {
  //         dispatch(setLoading(false));
  //       }
  //     }
  //   };
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
            // handleFocus();
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
      <div>
        {loading && <p className="loader">Loading...</p>}
        {error && <p className="error">{error}</p>}
      </div>
    </form>
  );
}
