import { Modal } from "@mantine/core";

const ProjectUpdateModal = ({ opened, onClose, projectId }) => {
    return(
        <>
            <Modal
                opened={opened}
                onClose={onClose}
                title="Proje Güncelle"
                centered
                size="lg"
                scrollAreaComponent="div"
            >
                deneme
            </Modal>
        </>
    )
}

export default ProjectUpdateModal;