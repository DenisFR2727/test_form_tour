import { startSearchPrices } from "../../api/api";
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
import { getCountryID } from "../../utils/getCountryId";
import DropdownList from "../dropdown/dropdown";

import {
  errorSelector,
  loadingSelector,
  resultsSelector,
  selectedSelector,
} from "./selectors";

import "./form.scss";

export default function TourSearchForm() {
  const dispatch = useAppDispatch();
  const loading = useAppSelector(loadingSelector);
  const selected = useAppSelector(selectedSelector);
  const results = useAppSelector(resultsSelector);
  const error = useAppSelector(errorSelector);

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
    <div className="form_content">
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
        <div>{error && <p className="error">{error}</p>}</div>
      </form>
    </div>
  );
}
