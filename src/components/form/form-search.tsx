import { startSearchPrices, GeoEntity } from "../../api/api";
import DropdownList from "../dropdown/dropdown";
import Loading from "../loading/loading";

import "./form.scss";
import { useAppDispatch, useAppSelector } from "../../hooks/hooks";
import useFetchTours, { useFetchSearchResults } from "./hooks";
import {
  setError,
  setLoading,
  setOpen,
  setQuery,
  setSelected,
  setTours,
} from "./tourSlice";
import { handleApiError } from "./error";

// Функція для витягнення countryID з GeoEntity
function getCountryID(selected: GeoEntity | null): string | null {
  if (!selected) return null;

  if (selected.type === "country") {
    return selected.id;
  }

  if (selected.type === "hotel") {
    return selected.countryId;
  }

  if (selected.type === "city" && selected.countryId) {
    return selected.countryId;
  }

  return null;
}

export default function TourSearchForm() {
  const dispatch = useAppDispatch();
  const loading = useAppSelector((state) => state.loading);
  const selected = useAppSelector((state) => state.selected);
  const results = useAppSelector((state) => state.results);
  const error = useAppSelector((state) => state.error);

  const { query, open, handleSelect } = useFetchTours();
  const { fetchSearchResults } = useFetchSearchResults();

  // --- Сабміт форми ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const countryID = getCountryID(selected);
    if (!countryID) return;

    dispatch(setError(null));
    dispatch(setTours([]));
    dispatch(setLoading(true));

    try {
      const res = await startSearchPrices(countryID);

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(`Помилка ${errorData.code}: ${errorData.message}`);
      }

      const json = await res.json();
      const { token, waitUntil } = json;

      const delay = new Date(waitUntil).getTime() - Date.now();

      await fetchSearchResults(token, delay, 2);
    } catch (error: unknown) {
      dispatch(setError(handleApiError(error)));
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSubmit(e);
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
        {loading && <Loading />}
        {error && <p className="error">{error}</p>}
      </div>
    </form>
  );
}
