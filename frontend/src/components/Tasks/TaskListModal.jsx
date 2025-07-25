import { useEffect, useState } from "react";
import {Modal,Text,Group,Stack,Button,Paper,TextInput,Loader,ActionIcon} from "@mantine/core";
import {IconPlus,IconEdit,IconTrash,IconCheck,IconX,} from '@tabler/icons-react';
import { modals } from '@mantine/modals';
import axios from "axios";
import TaskAddModal from "./TaskAddModal";
import { notifications } from "@mantine/notifications";

const TaskListModal = ({ opened, onClose, process }) => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(false);
    const [editingTaskId, setEditingTaskId] = useState(null);
    const [editingTaskName, setEditingTaskName] = useState("");
    const [taskAddModalOpened, setTaskAddModalOpened] = useState(false);

    const token = localStorage.getItem("token");

    const fetchTasks = async () => {
        if (!process?.id) return;

        setLoading(true);
        try {
            const response = await axios.get(
                `http://localhost:5000/api/Tasks/by-process/${process.id}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setTasks(response.data);
        } catch (error) {
            console.error("Görevler alınamadı:", error);
            setTasks([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (opened && process) {
            fetchTasks();
        }
    }, [opened, process]);

    const handleEditStart = (task) => {
        setEditingTaskId(task.id);
        setEditingTaskName(task.title);
    };

    const handleEditCancel = () => {
        setEditingTaskId(null);
        setEditingTaskName("");
    };

    const handleEditSave = async (taskId) => {
        if (!editingTaskName.trim()) {
            return;
        }

        try {
            await axios.put(
                `http://localhost:5000/api/tasks/${taskId}`,
                { title: editingTaskName.trim() },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            // Görevleri yeniden yükle
            await fetchTasks();
            setEditingTaskId(null);
            setEditingTaskName("");
        } catch (error) {
            console.error("Görev güncellenemedi:", error);
        }
    };

    const handleDelete = (task) => {
        modals.openConfirmModal({
            title: 'Görevi Sil',
            children: (
                <Text size="sm">
                    <strong>{task.title}</strong> görevini silmek istediğinize emin misiniz?
                    Bu işlem geri alınamaz.
                </Text>
            ),
            labels: { confirm: 'Sil', cancel: 'İptal' },
            confirmProps: { color: 'red' },
            onConfirm: async () => {
                try {
                    await axios.delete(
                        `http://localhost:5000/api/tasks/${task.id}`,
                        {
                            headers: { Authorization: `Bearer ${token}` },
                        }
                    );
                    notifications.show({
                        title: 'Silme Başarılı',
                        message: `"${task.title}" görevi silindi.`,
                        color: 'green',
                    });
                    await fetchTasks();
                } catch (error) {
                    console.error("Görev silinemedi:", error);
                    notifications.show({
                        title: 'Silme Başarısız',
                        message: 'Görev silinirken bir hata oluştu.',
                        color: 'red',
                    });
                }
            },
        });
    };


    const handleTaskAdded = () => {
        fetchTasks(); // Görevleri yeniden yükle
    };

    return (
        <>
            <Modal
                opened={opened}
                onClose={onClose}
                title={
                    <Group spacing="sm">
                        <div>
                            <Text size="lg" weight={600} color="#2d3748">
                                {process?.name} - Görevler
                            </Text>
                            <Text size="sm" color="dimmed">
                                Toplam {tasks.length} görev
                            </Text>
                        </div>
                    </Group>
                }
                size="xl"
                padding="xl"
                centered
                overlayProps={{ blur: 3 }}
            >
                <Stack spacing="lg">
                    {/* Add Task Button */}
                    <div className="flex justify-end">
                        <Button
                            leftSection={<IconPlus size={16} />}
                            onClick={() => setTaskAddModalOpened(true)}
                            className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                        >
                            Görev Ekle
                        </Button>
                    </div>

                    {/* Loading */}
                    {loading && (
                        <div className="flex justify-center py-8">
                            <Loader size="lg" />
                        </div>
                    )}
                    {/* Tasks List */}
                    {!loading && tasks.length > 0 && (
                        <Stack spacing="sm">
                            {tasks.map((task) => (
                                <Paper
                                    key={task.id}
                                    shadow="xs"
                                    radius="md"
                                    p="md"
                                    withBorder
                                    className="flex justify-between items-center"
                                >
                                    {/* Task Name or Input */}
                                    <div className="flex-1">
                                        {editingTaskId === task.id ? (
                                            <TextInput
                                                value={editingTaskName}
                                                onChange={(e) => setEditingTaskName(e.target.value)}
                                                placeholder="Görev adı"
                                                size="sm"
                                                onKeyPress={(e) => {
                                                    if (e.key === 'Enter') {
                                                        handleEditSave(task.id);
                                                    }
                                                }}
                                                autoFocus
                                            />
                                        ) : (
                                            <Text size="md" weight={500} color="#2d3748">
                                                {task.title}
                                            </Text>
                                        )}
                                    </div>

                                    {/* Action Buttons */}
                                    <Group spacing="xs" className="ml-4">
                                        {editingTaskId === task.id ? (
                                            <>
                                                <ActionIcon
                                                    size="sm"
                                                    color="green"
                                                    variant="light"
                                                    onClick={() => handleEditSave(task.id)}
                                                >
                                                    <IconCheck size={16} />
                                                </ActionIcon>
                                                <ActionIcon
                                                    size="sm"
                                                    color="gray"
                                                    variant="light"
                                                    onClick={handleEditCancel}
                                                >
                                                    <IconX size={16} />
                                                </ActionIcon>
                                            </>
                                        ) : (
                                            <>
                                                <Button
                                                    size="xs"
                                                    variant="light"
                                                    color="blue"
                                                    leftSection={<IconEdit size={14} />}
                                                    onClick={() => handleEditStart(task)}
                                                >
                                                    Düzenle
                                                </Button>
                                                <Button
                                                    size="xs"
                                                    variant="outline"
                                                    color="red"
                                                    leftSection={<IconTrash size={14} />}
                                                    onClick={() => handleDelete(task)}
                                                >
                                                    Sil
                                                </Button>
                                            </>
                                        )}
                                    </Group>
                                </Paper>
                            ))}
                        </Stack>
                    )}

                    {/* No Tasks */}
                    {!loading && tasks.length === 0 && (
                        <Paper
                            shadow="sm"
                            padding="xl"
                            className="text-center bg-gray-50"
                            radius="md"
                        >
                            <Stack align="center" spacing="md">
                                <div>
                                    <Text size="lg" weight={500} color="#6b7280">
                                        Henüz görev bulunmamaktadır
                                    </Text>
                                    <Text size="sm" color="dimmed" className="mt-1">
                                        İlk görevi eklemek için yukarıdaki "Görev Ekle" butonuna tıklayın
                                    </Text>
                                </div>
                            </Stack>
                        </Paper>
                    )}
                </Stack>
            </Modal>

            {/* Task Add Modal */}
            <TaskAddModal
                opened={taskAddModalOpened}
                onClose={() => setTaskAddModalOpened(false)}
                process={process}
                onTaskAdded={handleTaskAdded}
            />
        </>
    );
};

export default TaskListModal;