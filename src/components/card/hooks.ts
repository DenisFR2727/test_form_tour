import { useCallback, useEffect, useState } from "react";
import {
  Country,
  getCountries,
  getHotels,
  Hotel,
  HotelsMap,
} from "../../api/api";
import { useAppDispatch, useAppSelector } from "../../hooks/hooks";
import { setHotels } from "../form/tourSlice";

export default function useCardHotels() {
  const dispatch = useAppDispatch();
  const tours = useAppSelector((state) => state.tours);
  const hotels = useAppSelector((state) => state.hotels);
  const selected = useAppSelector((state) => state.selected);

  const [countries, setCountries] = useState<Record<string, Country>>({});

  // Завантаження країн для прапорців
  useEffect(() => {
    if (Object.keys(countries).length === 0) {
      (async () => {
        try {
          const res = await getCountries();
          const countriesData = await res.json();
          setCountries(countriesData);
        } catch (error) {
          console.error("Помилка завантаження країн:", error);
        }
      })();
    }
  }, [countries]);

  // Витягнення countryID з обраного елемента
  const getCountryID = useCallback((): string | null => {
    if (!selected) {
      // Якщо немає обраного, спробуємо знайти countryID через готелі
      const firstTour = tours.find((tour) => tour.hotelID);
      if (firstTour?.hotelID) {
        const hotel = Object.values(hotels).find(
          (h) => String(h.id) === firstTour.hotelID
        );
        return hotel?.countryId || null;
      }
      return null;
    }

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
  }, [selected, tours, hotels]);
  // Завантаження готелів для країни
  useEffect(() => {
    const countryID = getCountryID();
    if (!countryID || tours.length === 0) {
      return;
    }

    // Перевіряємо, чи всі готелі для турів вже завантажені
    const missingHotelIds = tours
      .filter((tour) => tour.hotelID)
      .map((tour) => tour.hotelID!)
      .filter((hotelId) => !hotels[hotelId]);

    if (missingHotelIds.length === 0) {
      return;
    }

    // Перевіряємо, чи готелі для цієї країни вже завантажені
    const countryHotels = Object.values(hotels).filter(
      (h) => h.countryId === countryID
    );

    if (countryHotels.length > 0) {
      // Готелі для цієї країни вже завантажені
      return;
    }

    (async () => {
      try {
        const res = await getHotels(countryID);
        if (res.ok) {
          const hotelsData = (await res.json()) as Record<string, Hotel>;
          // Зберігаємо готелі з ключем hotel.id для швидкого пошуку
          const hotelsMap: HotelsMap = {};
          Object.values(hotelsData).forEach((hotel) => {
            hotelsMap[String(hotel.id)] = hotel;
          });
          dispatch(setHotels(hotelsMap));
        }
      } catch (error) {
        console.error("Помилка завантаження готелів:", error);
      }
    })();
  }, [tours, selected, hotels, dispatch, getCountryID]);

  return { countries, hotels, tours };
}
