import { Modal, Button, Stack } from "@mantine/core";

const ProjectCartSelectModal = ({ opened, onClose, projectId, onShowDetails }) => {
  const goToTasks = () => {
    window.location.href = `/projectTasks/${projectId}`; // veya navigate kullanabilirsin
  };

  return (
    <Modal opened={opened} onClose={onClose} title="Proje İşlemleri" centered>
      <Stack>
        <Button fullWidth onClick={goToTasks} color="blue">
          Görevleri Görüntüle
        </Button>
        <Button fullWidth onClick={onShowDetails} color="gray">
          Proje Detaylarına Git
        </Button>
      </Stack>
    </Modal>
  );
};

export default ProjectCartSelectModal;
