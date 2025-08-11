import { useState, useEffect } from "react";
import {
  Modal,
  TextInput,
  Textarea,
  Button,
  Group,
  Stack,
  Text,
  Paper,
  Badge
} from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import axios from "axios";

const TaskAddModal = ({ opened, onClose, process, onTaskAdded }) => {
  const [formData, setFormData] = useState({
    title: "",
    description: ""
  });
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");

  useEffect(() => {
    // Modal açıldığında form sıfırlansın
    if (opened) {
      setFormData({
        title: "",
        description: ""
      });
      
      // Süreç kontrolü
      if (!process?.id) {
        notifications.show({
          title: "Hata",
          message: "Süreç bilgisi alınamadı.",
          color: "red"
        });
        onClose();
        return;
      }
    }
  }, [opened, process, onClose]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Form validasyonları
    if (!formData.title.trim()) {
      notifications.show({
        title: "Hata",
        message: "Görev adı zorunludur",
        color: "red"
      });
      return;
    }

    if (!process?.id) {
      notifications.show({
        title: "Hata",
        message: "Geçerli bir süreç seçilmedi.",
        color: "red"
      });
      return;
    }

    if (!token) {
      notifications.show({
        title: "Hata",
        message: "Oturum açmanız gerekiyor.",
        color: "red"
      });
      return;
    }

    setLoading(true);
    try {
      // API'nin beklediği format
      const taskData = {
        processId: parseInt(process.id), // number olarak gönder
        title: formData.title.trim(),
        description: formData.description.trim() || "",
        CreatedBy: 0 // Bu değer genellikle backend'de token'dan alınır
      };

      console.log("Gönderilen veri:", taskData); // Debug için

      const response = await axios.post(
        "http://localhost:5000/api/tasks",
        taskData,
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          } 
        }
      );

      console.log("API Response:", response.data); // Debug için

      notifications.show({
        title: "Başarılı",
        message: "Görev başarıyla eklendi",
        color: "green"
      });

      // Form sıfırlama
      setFormData({ title: "", description: "" });
      
      // Callback çağırma
      if (onTaskAdded) {
        onTaskAdded();
      }
      
      onClose();
    } catch (error) {
      console.error("Görev eklenemedi:", error);
      console.error("Error response:", error.response?.data); // Debug için
      
      let errorMessage = "Görev eklenirken bir hata oluştu.";
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.status === 401) {
        errorMessage = "Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.";
      } else if (error.response?.status === 400) {
        errorMessage = "Geçersiz veri gönderildi.";
      } else if (error.response?.status === 500) {
        errorMessage = "Sunucu hatası oluştu.";
      }
      
      notifications.show({
        title: "Hata",
        message: errorMessage,
        color: "red"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({ title: "", description: "" });
    onClose();
  };

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title={
        <Group spacing="sm">
          <IconPlus size={24} color="#23657b" />
          <Text size="lg" weight={600} color="#2d3748">
            Yeni Görev Ekle
          </Text>
        </Group>
      }
      size="md"
      padding="xl"
      centered
      overlayProps={{ blur: 3 }}
    >
      <form onSubmit={handleSubmit}>
        <Stack spacing="lg">
          {/* Process Info */}
          <Paper padding="md" radius="md" className="bg-blue-50 border border-blue-200">
            <Group spacing="sm">
              <div className="flex-1 px-2">
                <Text size="md" weight={600} color="#1e3a8a">
                  {process?.name || "Süreç adı bulunamadı"}
                </Text>
                <Text size="sm" color="dimmed">
                  ID: {process?.id}
                </Text>
              </div>
              <Badge variant="light" color="blue" size="sm">
                {process?.isMainProcess ? "Ana Süreç" : "Alt Süreç"}
              </Badge>
            </Group>
          </Paper>

          {/* Görev Adı */}
          <TextInput
            label="Görev Adı"
            placeholder="Görev adını giriniz..."
            value={formData.title}
            onChange={(e) => handleInputChange("title", e.target.value)}
            required
            size="md"
            classNames={{
              label: "text-gray-700 font-medium mb-1",
              input: "border-gray-300 focus:border-blue-500"
            }}
          />

          {/* Açıklama */}
          <Textarea
            label="Açıklama"
            placeholder="Görev açıklamasını giriniz... (İsteğe bağlı)"
            value={formData.description}
            onChange={(e) => handleInputChange("description", e.target.value)}
            rows={4}
            size="md"
            classNames={{
              label: "text-gray-700 font-medium mb-1",
              input: "border-gray-300 focus:border-blue-500"
            }}
          />

          {/* Butonlar */}
          <Group position="right" spacing="md" className="mt-6">
            <Button
              variant="outline"
              color="gray"
              onClick={handleClose}
              disabled={loading}
              size="md"
            >
              İptal
            </Button>
            <Button
              type="submit"
              loading={loading}
              leftSection={<IconPlus size={16} />}
              className="bg-gradient-to-r from-ivosis-500 to-ivosis-600 hover:from-ivosis-600 hover:to-ivosis-500"
              size="md"
            >
              {loading ? "Ekleniyor..." : "Ekle"}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
};

export default TaskAddModal;