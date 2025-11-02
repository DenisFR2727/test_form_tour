import { RootState } from "../../store/store";

export const querySelector = (state: RootState) => state.query;
export const openSelector = (state: RootState) => state.open;

export const loadingSelector = (state: RootState) => state.loading;
export const selectedSelector = (state: RootState) => state.selected;
export const resultsSelector = (state: RootState) => state.results;
export const errorSelector = (state: RootState) => state.error;
