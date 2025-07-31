import { Modal, Button, Stack } from "@mantine/core";

const ProjectCartSelectModal = ({ opened, onClose, projectId, onShowDetails, onShowUpdate }) => {
  const goToTasks = () => {
  localStorage.setItem("selectedProjectId", projectId); // projectId'yi kaydet
  window.location.href = "/projectTasks";
};

  

  return (
    <Modal opened={opened} onClose={onClose} title="Proje İşlemleri" centered>
      <Stack>
        <Button fullWidth onClick={onShowUpdate} color="blue">
          Projeyi Güncelle
        </Button>
        <Button fullWidth onClick={goToTasks} color="gray">
          Görevleri Görüntüle
        </Button>
        <Button fullWidth onClick={onShowDetails} color="green">
          Süreç Oluştur
        </Button>
      </Stack>
    </Modal>
  );
};

export default ProjectCartSelectModal;
