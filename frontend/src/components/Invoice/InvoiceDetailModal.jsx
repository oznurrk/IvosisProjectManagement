import React from 'react';
import { Modal, Button, Text, Group, Stack, Paper, Badge, Divider } from '@mantine/core';
import { IconX, IconCalendar, IconUser, IconCurrencyLira, IconFileText } from '@tabler/icons-react';

const InvoiceDetailModal = ({ opened, onClose, invoice }) => {
  if (!invoice) return null;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('tr-TR');
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'paid':
      case 'ödendi':
        return 'green';
      case 'pending':
      case 'bekliyor':
        return 'yellow';
      case 'overdue':
      case 'gecikmiş':
        return 'red';
      default:
        return 'gray';
    }
  };

  const getStatusText = (status) => {
    switch (status?.toLowerCase()) {
      case 'paid':
        return 'Ödendi';
      case 'pending':
        return 'Bekliyor';
      case 'overdue':
        return 'Gecikmiş';
      default:
        return status;
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Group>
          <IconFileText size={24} />
          <Text size="lg" weight={600}>Fatura Detayları</Text>
        </Group>
      }
      size="lg"
      centered
    >
      <Stack spacing="md">
        {/* Fatura Başlık Bilgileri */}
        <Paper p="md" withBorder>
          <Group position="apart" mb="md">
            <div>
              <Text size="xl" weight={700} color="blue">
                {invoice.invoiceNumber || 'F-2024-001'}
              </Text>
              <Text size="sm" color="dimmed">Fatura Numarası</Text>
            </div>
            <Badge 
              color={getStatusColor(invoice.status)} 
              size="lg"
              variant="filled"
            >
              {getStatusText(invoice.status)}
            </Badge>
          </Group>

          <Group grow>
            <div>
              <Group spacing="xs" mb={5}>
                <IconCalendar size={16} />
                <Text size="sm" weight={500}>Fatura Tarihi</Text>
              </Group>
              <Text>{formatDate(invoice.invoiceDate || new Date())}</Text>
            </div>
            <div>
              <Group spacing="xs" mb={5}>
                <IconCalendar size={16} />
                <Text size="sm" weight={500}>Vade Tarihi</Text>
              </Group>
              <Text>{formatDate(invoice.dueDate || new Date())}</Text>
            </div>
          </Group>
        </Paper>

        {/* Müşteri Bilgileri */}
        <Paper p="md" withBorder>
          <Group spacing="xs" mb="md">
            <IconUser size={20} />
            <Text size="lg" weight={600}>Müşteri Bilgileri</Text>
          </Group>
          
          <Stack spacing="xs">
            <div>
              <Text size="sm" color="dimmed">Müşteri Adı</Text>
              <Text weight={500}>{invoice.customerName || 'Müşteri Adı'}</Text>
            </div>
            {invoice.customerEmail && (
              <div>
                <Text size="sm" color="dimmed">E-posta</Text>
                <Text>{invoice.customerEmail}</Text>
              </div>
            )}
            {invoice.customerPhone && (
              <div>
                <Text size="sm" color="dimmed">Telefon</Text>
                <Text>{invoice.customerPhone}</Text>
              </div>
            )}
            {invoice.customerAddress && (
              <div>
                <Text size="sm" color="dimmed">Adres</Text>
                <Text>{invoice.customerAddress}</Text>
              </div>
            )}
          </Stack>
        </Paper>

        {/* Fatura Kalemleri */}
        <Paper p="md" withBorder>
          <Text size="lg" weight={600} mb="md">Fatura Kalemleri</Text>
          
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #e0e0e0' }}>
                  <th style={{ textAlign: 'left', padding: '8px', fontSize: '14px' }}>Ürün/Hizmet</th>
                  <th style={{ textAlign: 'center', padding: '8px', fontSize: '14px' }}>Miktar</th>
                  <th style={{ textAlign: 'right', padding: '8px', fontSize: '14px' }}>Birim Fiyat</th>
                  <th style={{ textAlign: 'right', padding: '8px', fontSize: '14px' }}>Toplam</th>
                </tr>
              </thead>
              <tbody>
                {invoice.items?.map((item, index) => (
                  <tr key={index} style={{ borderBottom: '1px solid #f0f0f0' }}>
                    <td style={{ padding: '12px 8px' }}>
                      <Text weight={500}>{item.description || `Kalem ${index + 1}`}</Text>
                    </td>
                    <td style={{ padding: '12px 8px', textAlign: 'center' }}>
                      {item.quantity || 1}
                    </td>
                    <td style={{ padding: '12px 8px', textAlign: 'right' }}>
                      {formatCurrency(item.unitPrice || 0)}
                    </td>
                    <td style={{ padding: '12px 8px', textAlign: 'right' }}>
                      <Text weight={500}>
                        {formatCurrency((item.quantity || 1) * (item.unitPrice || 0))}
                      </Text>
                    </td>
                  </tr>
                )) || (
                  <tr>
                    <td colSpan={4} style={{ padding: '20px', textAlign: 'center' }}>
                      <Text color="dimmed">Fatura kalemi bulunamadı</Text>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Paper>

        {/* Fatura Toplamları */}
        <Paper p="md" withBorder>
          <Stack spacing="xs">
            <Group position="apart">
              <Text>Ara Toplam:</Text>
              <Text>{formatCurrency(invoice.subtotal || 0)}</Text>
            </Group>
            
            {invoice.taxAmount && (
              <Group position="apart">
                <Text>KDV ({invoice.taxRate || 18}%):</Text>
                <Text>{formatCurrency(invoice.taxAmount)}</Text>
              </Group>
            )}
            
            {invoice.discount && (
              <Group position="apart">
                <Text color="red">İndirim:</Text>
                <Text color="red">-{formatCurrency(invoice.discount)}</Text>
              </Group>
            )}
            
            <Divider />
            
            <Group position="apart">
              <Text size="lg" weight={700}>Genel Toplam:</Text>
              <Group spacing="xs">
                <IconCurrencyLira size={20} />
                <Text size="xl" weight={700} color="blue">
                  {formatCurrency(invoice.totalAmount || 0)}
                </Text>
              </Group>
            </Group>
          </Stack>
        </Paper>

        {/* Notlar */}
        {invoice.notes && (
          <Paper p="md" withBorder>
            <Text size="md" weight={600} mb="xs">Notlar</Text>
            <Text size="sm" color="dimmed">{invoice.notes}</Text>
          </Paper>
        )}

        {/* Eylem Butonları */}
        <Group position="right" mt="md">
          <Button variant="outline" onClick={onClose}>
            Kapat
          </Button>
          <Button 
            onClick={() => {
              // Fatura düzenleme fonksiyonu
              console.log('Fatura düzenle:', invoice.id);
            }}
          >
            Düzenle
          </Button>
          <Button 
            color="green"
            onClick={() => {
              // PDF indirme fonksiyonu
              console.log('PDF indir:', invoice.id);
            }}
          >
            PDF İndir
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
};

export default InvoiceDetailModal;