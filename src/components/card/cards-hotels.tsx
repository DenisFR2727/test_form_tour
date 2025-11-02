import { useAppSelector } from "../../hooks/hooks";
import { formatDate, formatPrice } from "../../utils/formatters";
import { Link } from "react-router-dom";
import Loading from "../loading/loading";
import useCardHotels from "./hooks";

import "./cards.scss";

export default function TourResults() {
  const loading = useAppSelector((state) => state.loading);
  const error = useAppSelector((state) => state.error);
  const { tours, hotels, countries } = useCardHotels();

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
                      {formatPrice(tour.amount)}
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
                  <p className="tour-card-price">{formatPrice(tour.amount)}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
