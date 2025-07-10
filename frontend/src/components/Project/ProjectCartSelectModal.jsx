import {  Button, Divider, Modal, Stack, Text } from "@mantine/core"
import { useState } from "react";

const ProjectCartSelectModal = ({opened,onClose}) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    return(
        <Modal
            opened={opened}
            onClose={onClose}
            size="xl"
            centered
            scrollAreaComponent="div"
            title={
                <Text size="lg" fw={700}>
                    İşlem Seç
                </Text>
            }
            classNames={{
                body: "p-4 sm:p-6",
            }}
        >
            <Divider my="sm" size="xs" color="gray" />

            {loading ? (
                <Text>Yükleniyor</Text>
            ) : error ? (
                <Text color="red">{error}</Text>
            ) : (
                <>
                    <Button mt="lg" fullWidth>Deneme</Button>
                </>
            )}
        </Modal>
    )
}


export default ProjectCartSelectModal;
