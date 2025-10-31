export interface DropdownProps {
  children: React.ReactNode;
}
export interface DropdownListProps {
  loading: boolean;
  results: GeoEntity[];
  handleSelect: (item: GeoEntity) => void;
}
