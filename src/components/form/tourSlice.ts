import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { GeoEntity, PriceOffer } from "../../api/api";

interface InitialStateTours {
  query: string;
  open: boolean;
  results: GeoEntity[];
  loading: boolean;
  selected: GeoEntity | null;
  tours: PriceOffer[];
  error: string | null;
}

const initialState: InitialStateTours = {
  query: "",
  open: false,
  results: [],
  loading: false,
  selected: null,
  tours: [],
  error: null,
};

const tourSLice = createSlice({
  name: "tours",
  initialState,
  reducers: {
    setQuery(state, action: PayloadAction<string>) {
      state.query = action.payload;
    },
    setOpen(state, action: PayloadAction<boolean>) {
      state.open = action.payload;
    },
    setResults(state, action: PayloadAction<GeoEntity[]>) {
      state.results = action.payload;
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    setSelected(state, action: PayloadAction<GeoEntity | null>) {
      state.selected = action.payload;
    },
    setTours(state, action: PayloadAction<PriceOffer[]>) {
      state.tours = action.payload;
    },
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },
  },
});

export const {
  setQuery,
  setOpen,
  setResults,
  setLoading,
  setSelected,
  setTours,
  setError,
} = tourSLice.actions;
export default tourSLice.reducer;
