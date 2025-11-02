import { useParams } from "react-router-dom";
import { formatDate, formatPrice } from "../../utils/formatters";
import { renderService } from "./services-details-tour";
import useTourDetail from "./hooks";
import Loading from "../loading/loading";

import "./tour-detail.scss";

export default function TourDetailPage() {
  const { priceId } = useParams<{ priceId: string }>();
  const { price, hotel, countries, loading, error } = useTourDetail(priceId);

  if (loading) {
    return (
      <div className="tour-detail">
        <div className="tour-detail-loading">
          <Loading />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="tour-detail">
        <div className="tour-detail-error">
          <p className="error">{error}</p>
        </div>
      </div>
    );
  }

  if (!price) {
    return (
      <div className="tour-detail">
        <div className="tour-detail-error">
          <p>Тур не знайдено</p>
        </div>
      </div>
    );
  }

  return (
    <div className="tour-detail">
      <div className="tour-detail-container">
        {hotel ? (
          <>
            <div className="tour-detail-header">
              <h1 className="tour-detail-title">{hotel.name}</h1>
              <div className="tour-detail-location">
                {countries[hotel.countryId] && (
                  <img
                    src={countries[hotel.countryId].flag}
                    alt={hotel.countryName}
                    className="tour-detail-flag"
                  />
                )}
                <span>{hotel.countryName}</span>
                <span className="tour-detail-location-separator">•</span>
                <span>{hotel.cityName}</span>
              </div>
            </div>

            {hotel.img && (
              <img
                src={hotel.img}
                alt={hotel.name}
                className="tour-detail-img"
              />
            )}

            {hotel.description && (
              <div className="tour-detail-section">
                <h2 className="tour-detail-section-title">Опис</h2>
                <p className="tour-detail-description">{hotel.description}</p>
              </div>
            )}

            {hotel.services && (
              <div className="tour-detail-section">
                <h2 className="tour-detail-section-title">Сервіси</h2>
                <div className="tour-detail-services">
                  {Object.entries(hotel.services).map(([key, value]) =>
                    renderService(key, value)
                  )}
                </div>
              </div>
            )}

            <div className="tour-detail-booking">
              <div className="tour-detail-booking-info">
                <div className="tour-detail-date">
                  <span className="tour-detail-date-icon">📅</span>
                  <span>{formatDate(price.startDate)}</span>
                </div>
                <div className="tour-detail-price">
                  {formatPrice(price.amount)}
                </div>
              </div>
              <button className="tour-detail-button">Відкрити ціну</button>
            </div>
          </>
        ) : (
          <div className="tour-detail-no-hotel">
            <p>Інформація про готель не знайдена</p>
            <div className="tour-detail-booking-info">
              <div className="tour-detail-date">
                <span className="tour-detail-date-icon">📅</span>
                <span>{formatDate(price.startDate)}</span>
              </div>
              <div className="tour-detail-price">
                {formatPrice(price.amount)}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
