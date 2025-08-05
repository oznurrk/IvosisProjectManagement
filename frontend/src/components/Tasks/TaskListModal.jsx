import { useEffect, useState } from "react";
import {Modal,Text,Group,Stack,Button,Paper,TextInput,Textarea,Loader,ActionIcon} from "@mantine/core";
import {IconPlus,IconEdit,IconTrash,IconCheck,IconX,} from '@tabler/icons-react';
import { modals } from '@mantine/modals';
import axios from "axios";
import TaskAddModal from "./TaskAddModal";
import { notifications } from "@mantine/notifications";

const TaskListModal = ({ opened, onClose, process }) => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(false);
    const [editingTaskId, setEditingTaskId] = useState(null);
    const [editingTaskTitle, setEditingTaskTitle] = useState("");
    const [editingTaskDescription, setEditingTaskDescription] = useState("");
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
            notifications.show({
                title: 'Hata',
                message: 'Görevler yüklenirken bir hata oluştu.',
                color: 'red',
            });
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
        setEditingTaskTitle(task.title || "");
        setEditingTaskDescription(task.description || "");
    };

    const handleEditCancel = () => {
        setEditingTaskId(null);
        setEditingTaskTitle("");
        setEditingTaskDescription("");
    };

    const handleEditSave = async (taskId) => {
        if (!editingTaskTitle.trim()) {
            notifications.show({
                title: 'Uyarı',
                message: 'Görev başlığı boş olamaz.',
                color: 'yellow',
            });
            return;
        }

        try {
            await axios.put(
                `http://localhost:5000/api/Tasks/${taskId}`,
                { 
                    title: editingTaskTitle.trim(),
                    description: editingTaskDescription.trim() 
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            notifications.show({
                title: 'Başarılı',
                message: 'Görev güncellendi.',
                color: 'green',
            });

            // Görevleri yeniden yükle
            await fetchTasks();
            setEditingTaskId(null);
            setEditingTaskTitle("");
            setEditingTaskDescription("");
        } catch (error) {
            console.error("Görev güncellenemedi:", error);
            notifications.show({
                title: 'Hata',
                message: 'Görev güncellenirken bir hata oluştu.',
                color: 'red',
            });
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
                        `http://localhost:5000/api/Tasks/${task.id}`,
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
                            onClick={() => setTaskAddModalOpened(true)}
                            className="bg-gradient-to-r from-ivosis-500 to-ivosis-600 text-white px-6 py-3 h-8.5 rounded-lg shadow-lg hover:from-ivosis-600 hover:to-ivosis-500 transition-all duration-200 flex items-center gap-2 font-semibold"
                        >
                            <IconPlus size={16} />
                        Ekle
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
                                    className="border-l-4 border-l-ivosis-500"
                                >
                                    {editingTaskId === task.id ? (
                                        // Edit Mode
                                        <Stack spacing="md">
                                            <TextInput
                                                label="Görev Başlığı"
                                                value={editingTaskTitle}
                                                onChange={(e) => setEditingTaskTitle(e.target.value)}
                                                placeholder="Görev başlığını girin"
                                                size="sm"
                                                required
                                                autoFocus
                                            />
                                            <Textarea
                                                label="Açıklama"
                                                value={editingTaskDescription}
                                                onChange={(e) => setEditingTaskDescription(e.target.value)}
                                                placeholder="Görev açıklamasını girin"
                                                size="sm"
                                                minRows={3}
                                                maxRows={6}
                                                autosize
                                            />
                                            <Group spacing="xs" position="right">
                                                <ActionIcon
                                                    size="lg"
                                                    color="green"
                                                    variant="light"
                                                    onClick={() => handleEditSave(task.id)}
                                                    title="Kaydet"
                                                >
                                                    <IconCheck size={18} />
                                                </ActionIcon>
                                                <ActionIcon
                                                    size="lg"
                                                    color="gray"
                                                    variant="light"
                                                    onClick={handleEditCancel}
                                                    title="İptal"
                                                >
                                                    <IconX size={18} />
                                                </ActionIcon>
                                            </Group>
                                        </Stack>
                                    ) : (
                                        // View Mode
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1 pr-4">
                                                <Text size="md" weight={600} color="#2d3748" className="mb-2">
                                                    {task.title}
                                                </Text>
                                                {task.description && (
                                                    <Text size="sm" color="#6b7280" className="whitespace-pre-wrap">
                                                        {task.description}
                                                    </Text>
                                                )}
                                                {!task.description && (
                                                    <Text size="sm" color="dimmed" style={{ fontStyle: 'italic' }}>
                                                        Açıklama bulunmamaktadır
                                                    </Text>
                                                )}
                                            </div>

                                            {/* Action Buttons */}
                                            <Group spacing="xs" className="flex-shrink-0">
                                                <Button
                                                    size="xs"
                                                    variant="light"
                                                    color="blue"
                                                    onClick={() => handleEditStart(task)}
                                                >
                                                    <IconEdit size={14} />
                                                </Button>
                                                <Button
                                                    size="xs"
                                                    variant="outline"
                                                    color="red"
                                                   
                                                    onClick={() => handleDelete(task)}
                                                >
                                                    <IconTrash size={14} />
                                                </Button>
                                                    
                                                
                                            </Group>
                                        </div>
                                    )}
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