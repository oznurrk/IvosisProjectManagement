import React from 'react';
import { Group, Text, Button, Select } from '@mantine/core';

const PaginationComponent = ({
  totalItems,
  currentPage,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [4, 8, 12, 16, 20],
  itemName = "kayıt"
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

  // Custom pagination navigation component
  const PaginationNav = ({ className = "" }) => {
    if (totalPages <= 1) return null;

    return (
      <nav className={`relative z-0 inline-flex rounded-md shadow-sm -space-x-px justify-center ${className}`}>
        <Button
          onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
          disabled={currentPage === 1}
          variant="outline"
          size="sm"
          className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
          styles={{
            root: {
              borderRadius: '0.375rem 0 0 0.375rem',
              border: '1px solid #d1d5db',
              backgroundColor: 'white',
              color: '#6b7280',
              fontSize: '0.875rem',
              fontWeight: '500',
              padding: '0.5rem',
              '&:hover:not(:disabled)': {
                backgroundColor: '#f9fafb'
              },
              '&:disabled': {
                opacity: 0.5
              }
            }
          }}
        >
          Önceki
        </Button>

        {[...Array(totalPages)].map((_, index) => {
          const pageNumber = index + 1;
          return (
            <Button
              key={pageNumber}
              onClick={() => onPageChange(pageNumber)}
              variant={currentPage === pageNumber ? "filled" : "outline"}
              size="sm"
              className="relative inline-flex items-center px-4 py-2 border text-sm font-medium"
              styles={{
                root: {
                  borderRadius: '0',
                  border: '1px solid #d1d5db',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  padding: '0.5rem 1rem',
                  ...(currentPage === pageNumber ? {
                    zIndex: 10,
                    backgroundColor: '#fef7f0',
                    borderColor: '#f97316',
                    color: '#ea580c'
                  } : {
                    backgroundColor: 'white',
                    color: '#6b7280',
                    '&:hover': {
                      backgroundColor: '#f9fafb'
                    }
                  })
                }
              }}
            >
              {pageNumber}
            </Button>
          );
        })}

        <Button
          onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
          disabled={currentPage === totalPages}
          variant="outline"
          size="sm"
          className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
          styles={{
            root: {
              borderRadius: '0 0.375rem 0.375rem 0',
              border: '1px solid #d1d5db',
              backgroundColor: 'white',
              color: '#6b7280',
              fontSize: '0.875rem',
              fontWeight: '500',
              padding: '0.5rem',
              '&:hover:not(:disabled)': {
                backgroundColor: '#f9fafb'
              },
              '&:disabled': {
                opacity: 0.5
              }
            }
          }}
        >
          Sonraki
        </Button>
      </nav>
    );
  };

  return (
    <>
      {/* Masaüstü: Pagination ve Sayfa başına seçim yan yana */}
      <div className="hidden sm:flex flex-row items-center justify-center w-full gap-4" style={{ marginTop: '3rem', padding: '0 1rem' }}>
        <Text size="sm" style={{ color: '#374151', marginBottom: 0 }}>
          <Text component="span" fw={500}>{startItem}</Text> - <Text component="span" fw={500}>{endItem}</Text> arası, toplam <Text component="span" fw={500}>{totalItems}</Text> {itemName}
        </Text>
        
        <PaginationNav />
        
        {/* Sayfa başına gösterilecek kayıt sayısı seçimi */}
        <Group gap="xs" align="center">
          <Text size="sm" style={{ color: '#374151', marginRight: '0.5rem' }}>
            Sayfa başına:
          </Text>
          <Select
            data={pageSizeOptions.map(opt => ({
              value: opt.toString(),
              label: opt.toString()
            }))}
            value={pageSize.toString()}
            onChange={(value) => onPageSizeChange(parseInt(value))}
            size="sm"
            w={80}
            allowDeselect={false}
            styles={{
              input: {
                border: '1px solid #d1d5db',
                borderRadius: '0.25rem',
                padding: '0.25rem 0.5rem',
                fontSize: '0.875rem'
              }
            }}
          />
        </Group>
      </div>

      {/* Mobil görünüm */}
      <div className="sm:hidden" style={{ marginTop: '3rem', padding: '0 1rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          <Text size="sm" style={{ color: '#374151', textAlign: 'center' }}>
            <Text component="span" fw={500}>{startItem}</Text> - <Text component="span" fw={500}>{endItem}</Text> arası, toplam <Text component="span" fw={500}>{totalItems}</Text> {itemName}
          </Text>
          
          <PaginationNav />
          
          <Group gap="xs" align="center">
            <Text size="sm" style={{ color: '#374151' }}>
              Sayfa başına:
            </Text>
            <Select
              data={pageSizeOptions.map(opt => ({
                value: opt.toString(),
                label: opt.toString()
              }))}
              value={pageSize.toString()}
              onChange={(value) => onPageSizeChange(parseInt(value))}
              size="sm"
              w={80}
              allowDeselect={false}
              styles={{
                input: {
                  border: '1px solid #d1d5db',
                  borderRadius: '0.25rem',
                  padding: '0.25rem 0.5rem',
                  fontSize: '0.875rem'
                }
              }}
            />
          </Group>
        </div>
      </div>
    </>
  );
};

export default PaginationComponent;