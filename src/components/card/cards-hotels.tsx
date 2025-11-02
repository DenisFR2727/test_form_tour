import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../hooks/hooks";
import { getHotels, HotelsMap, getCountries, Country } from "../../api/api";
import { setHotels } from "../form/tourSlice";
import Loading from "../loading/loading";
import { formatDate, formatPrice } from "../../utils/formatters";
import { Link } from "react-router-dom";
import "./cards.scss";

export default function TourResults() {
  const dispatch = useAppDispatch();
  const tours = useAppSelector((state) => state.tours);
  const hotels = useAppSelector((state) => state.hotels);
  const selected = useAppSelector((state) => state.selected);
  const loading = useAppSelector((state) => state.loading);
  const error = useAppSelector((state) => state.error);
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
  const getCountryID = (): string | null => {
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
  };

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
      // Всі готелі вже завантажені
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
          const hotelsData = await res.json();
          // Зберігаємо готелі з ключем hotel.id для швидкого пошуку
          const hotelsMap: HotelsMap = {};
          Object.values(hotelsData).forEach((hotel: any) => {
            hotelsMap[String(hotel.id)] = hotel;
          });
          dispatch(setHotels(hotelsMap));
        }
      } catch (error) {
        console.error("Помилка завантаження готелів:", error);
      }
    })();
  }, [tours, selected, hotels, dispatch]);

  if (loading) {
    return (
      <div className="tour-results-loading">
        <Loading />
      </div>
    );
  }

  if (error) {
    return (
      <div className="tour-results-error">
        <p className="error">{error}</p>
      </div>
    );
  }

  if (tours.length === 0) {
    return (
      <div className="tour-results-empty">
        <p>За вашим запитом турів не знайдено</p>
      </div>
    );
  }

  const sortedTours = [...tours].sort((a, b) => a.amount - b.amount);

  return (
    <div className="tour-results">
      <div className="tour-results-grid">
        {sortedTours.map((tour) => {
          const hotel = tour.hotelID
            ? Object.values(hotels).find((h) => String(h.id) === tour.hotelID)
            : null;

          return (
            <div key={tour.id} className="tour-card">
              {hotel ? (
                <>
                  <img
                    src={hotel.img}
                    alt={hotel.name}
                    className="tour-card-img"
                  />
                  <div className="tour-card-content">
                    <h3 className="tour-card-title">{hotel.name}</h3>
                    <p className="tour-card-location">
                      {countries[hotel.countryId] && (
                        <img
                          src={countries[hotel.countryId].flag}
                          alt={hotel.countryName}
                          className="tour-card-flag"
                        />
                      )}
                      {hotel.countryName}, {hotel.cityName}
                    </p>
                    <p className="tour-card-date">
                      {formatDate(tour.startDate)}
                    </p>
                    <p className="tour-card-price">
                      {formatPrice(tour.amount, tour.currency)}
                    </p>
                    <Link to={`/tour/${tour.id}`} className="tour-card-link">
                      Відкрити ціну
                    </Link>
                  </div>
                </>
              ) : (
                <div className="tour-card-content">
                  <p>Готель не знайдено</p>
                  <p className="tour-card-date">{formatDate(tour.startDate)}</p>
                  <p className="tour-card-price">
                    {formatPrice(tour.amount, tour.currency)}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
