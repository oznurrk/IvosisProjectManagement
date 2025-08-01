import React from 'react';
import { Pagination, Select, Group, Text, Stack } from '@mantine/core';

const PaginationComponent = ({
  totalItems,
  currentPage,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [4, 8, 12, 16, 20],
  itemName = "öğe"
}) => {
  const totalPages = Math.ceil(totalItems / pageSize);
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  // Sayfa değiştiğinde kontrol et ve gerekirse düzelt
  React.useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      onPageChange(totalPages);
    }
  }, [currentPage, totalPages, onPageChange]);

  if (totalItems === 0) {
    return null;
  }

  return (
    <Stack gap="md" align="center" mt="xl">
      {/* Sayfa boyutu seçici */}
      <Group gap="md" align="center">
        <Text size="sm" c="dimmed">
          Sayfa başına:
        </Text>
        <Select
          data={pageSizeOptions.map(size => ({
            value: size.toString(),
            label: `${size} ${itemName}`
          }))}
          value={pageSize.toString()}
          onChange={(value) => onPageSizeChange(parseInt(value))}
          size="sm"
          w={120}
          allowDeselect={false}
        />
      </Group>

      {/* Pagination kontrolü */}
      {totalPages > 1 && (
        <Pagination
          total={totalPages}
          page={currentPage}
          onChange={onPageChange}
          size="md"
          withEdges
          boundaries={1}
          siblings={1}
        />
      )}

      {/* Bilgi metni */}
      <Group gap="xs" justify="center">
        <Text size="sm" c="dimmed">
          {startItem}-{endItem} arası gösteriliyor,
        </Text>
        <Text size="sm" c="dimmed" fw={500}>
          toplam {totalItems} {itemName}
        </Text>
        {totalPages > 1 && (
          <>
            <Text size="sm" c="dimmed">
              •
            </Text>
            <Text size="sm" c="dimmed">
              Sayfa {currentPage} / {totalPages}
            </Text>
          </>
        )}
      </Group>
    </Stack>
  );
};

export default PaginationComponent;