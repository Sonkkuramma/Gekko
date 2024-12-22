import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export const FilterBar = ({
  filters,
  onFilterChange,
  onSearch,
  showExport = false,
  onExport,
}) => {
  return (
    <div className="flex gap-4 items-center">
      {filters.map(({ key, options, value }) => (
        <Select
          key={key}
          value={value}
          onValueChange={(newValue) => onFilterChange(key, newValue)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder={`Select ${key}`} />
          </SelectTrigger>
          <SelectContent>
            {options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ))}

      <Input
        placeholder="Search..."
        onChange={(e) => onSearch(e.target.value)}
        className="max-w-[200px]"
      />

      {showExport && (
        <Button variant="outline" onClick={onExport}>
          Export
        </Button>
      )}
    </div>
  );
};
