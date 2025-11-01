import { useCallback, useEffect } from "react";
import {
  Country,
  GeoEntity,
  GeoResponse,
  getCountries,
  searchGeo,
} from "../../api/api";
import { useAppDispatch, useAppSelector } from "../../hooks/hooks";
import {
  setLoading,
  setOpen,
  setQuery,
  setResults,
  setSelected,
} from "./tourSlice";

export default function useFetchTours() {
  const dispatch = useAppDispatch();
  const query = useAppSelector((state) => state.query);
  const open = useAppSelector((state) => state.open);

  // --- Loading country Завантаження країн при відкритті інпуту ---
  useEffect(() => {
    if (!open || query) return;

    (async () => {
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
    })();
  }, [open, query, dispatch]);

  // --- Search in input ---
  useEffect(() => {
    if (!query) return;

    (async () => {
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
    })();
  }, [query, dispatch]);

  // --- Select element ---
  const handleSelect = useCallback(
    (item: GeoEntity) => {
      dispatch(setSelected(item));
      dispatch(setQuery(item.name));
      dispatch(setOpen(false));
    },
    [dispatch]
  );

  return { query, open, handleSelect };
}
