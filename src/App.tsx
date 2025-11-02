import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";
import TourSearchForm from "./components/form/form-search";
import TourResults from "./components/card/cards-hotels";
import TourDetailPage from "./components/tour-detail/tour-detail";

function HomePage() {
  return (
    <>
      <TourSearchForm />
      <TourResults />
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/tour/:priceId" element={<TourDetailPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
