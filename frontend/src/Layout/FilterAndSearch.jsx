import {
  ActionIcon,
  Flex,
  Group,
  Paper,
  Select,
  Text,
  TextInput,
} from "@mantine/core";
import {
  IconCalendar,
  IconFilter,
  IconSearch,
  IconX,
} from "@tabler/icons-react";

const FilterAndSearch = ({
  searchFilters,
  handleFilterChange,
  clearFilters,
  filtersConfig = [],
}) => {
  const renderInput = (filter) => {
    const commonStyles = {
      minWidth: "200px",
      flexGrow: 1,
    };

    switch (filter.type) {
      case "text":
        return (
          <TextInput
            key={filter.key}
            leftSection={<IconSearch size={16} />}
            placeholder={filter.placeholder}
            value={searchFilters[filter.key] || ""}
            onChange={(e) => handleFilterChange(filter.key, e.target.value)}
            style={commonStyles}
          />
        );

      case "date":
        return (
          <TextInput
            key={filter.key}
            type="date"
            leftSection={<IconCalendar size={16} />}
            value={searchFilters[filter.key] || ""}
            onChange={(e) => handleFilterChange(filter.key, e.target.value)}
            style={commonStyles}
          />
        );

      case "select":
        return (
          <Select
            key={filter.key}
            placeholder={filter.placeholder}
            value={searchFilters[filter.key] || ""}
            onChange={(value) => handleFilterChange(filter.key, value)}
            data={filter.options || []}
            style={commonStyles}
          />
        );

      default:
        return null;
    }
  };

  return (
    <Paper shadow="md" p="md" className="mb-6 bg-white">
      <Group justify="between" className="mb-4">
        <Group gap="xs">
          <IconFilter size={20} color="#23657b" />
          <Text size="md" fw={500} c="#23657b">
            Filtreleme ve Arama
          </Text>
        </Group>
        <ActionIcon
          variant="light"
          color="#23657b"
          onClick={clearFilters}
          title="Filtreleri Temizle"
        >
          <IconX size={16} />
        </ActionIcon>
      </Group>

      <Flex wrap="wrap" gap="md" justify="flex-start">
        {filtersConfig.map((filter) => renderInput(filter))}
      </Flex>
    </Paper>
  );
};

export default FilterAndSearch;
