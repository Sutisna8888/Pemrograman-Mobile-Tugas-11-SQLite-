import React, { useEffect, useState } from "react";
import {
  Alert,
  Button,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import {
  Todo,
  addTodo,
  deleteTodo,
  getTodos,
  initDB,
  updateTodo,
} from "../services/todoService";

type FilterType = "ALL" | "DONE" | "UNDONE";

export default function TodoList() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [text, setText] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);

  const [filter, setFilter] = useState<FilterType>("ALL");

  useEffect(() => {
    (async () => {
      try {
        await initDB();
        await reload();
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

  async function reload() {
    const data = await getTodos();
    setTodos(data);
  }

  async function handleAddOrUpdate() {
    if (!text.trim()) return;
    try {
      if (editingId) {
        await updateTodo(editingId, { text: text.trim() });
        setEditingId(null);
      } else {
        await addTodo(text.trim());
      }
      setText("");
      await reload();
    } catch (e) {
      console.error(e);
    }
  }

  async function handleToggle(item: Todo) {
    try {
      await updateTodo(item.id!, { done: item.done ? 0 : 1 });
      await reload();
    } catch (e) {
      console.error(e);
    }
  }

  function startEdit(item: Todo) {
    setEditingId(item.id ?? null);
    setText(item.text);
  }

  function confirmDelete(item: Todo) {
    Alert.alert("Hapus Todo", "Yakin ingin menghapus?", [
      { text: "Batal", style: "cancel" },
      {
        text: "Hapus",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteTodo(item.id!);
            await reload();
          } catch (e) {
            console.error(e);
          }
        },
      },
    ]);
  }

  const filteredTodos = todos.filter((t) => {
    if (filter === "DONE") return t.done === 1;
    if (filter === "UNDONE") return t.done === 0;
    return true; // ALL
  });

  function renderItem({ item }: { item: Todo }) {
    return (
      <View style={styles.itemRow}>
        <TouchableOpacity onPress={() => handleToggle(item)} style={{ flex: 1 }}>
          <Text style={[styles.itemText, item.done ? styles.doneText : null]}>
            {item.text}
          </Text>
          {item.done === 1 && item.finished_at && (
            <Text style={styles.dateText}>Selesai: {item.finished_at}</Text>
          )}
        </TouchableOpacity>

        <View style={styles.actionButtons}>
          <Button title="Edit" onPress={() => startEdit(item)} />
          <View style={{ width: 8 }} />
          <Button color="#d9534f" title="Del" onPress={() => confirmDelete(item)} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Todo (SQLite)</Text>
      <View style={styles.inputRow}>
        <TextInput
          placeholder="Tulis todo..."
          value={text}
          onChangeText={setText}
          style={styles.input}
        />
        <Button title={editingId ? "Simpan" : "Tambah"} onPress={handleAddOrUpdate} />
      </View>
      <View style={styles.filterContainer}>
        <Text style={styles.filterLabel}>Filter Status:</Text>
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={filter}
            onValueChange={(itemValue) => setFilter(itemValue)}
            mode="dropdown" 
            style={styles.picker}
          >
            <Picker.Item label="Semua" value="ALL" />
            <Picker.Item label="Selesai (Done)" value="DONE" />
            <Picker.Item label="Belum (Undone)" value="UNDONE" />
          </Picker>
        </View>
      </View>

      <FlatList
        data={filteredTodos}
        keyExtractor={(i) => String(i.id)}
        renderItem={renderItem}
        ListEmptyComponent={() => (
          <Text style={{ textAlign: "center", marginTop: 20, color: "#888" }}>
            Tidak ada todo ({filter}).
          </Text>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, paddingTop: 50 },
  title: { fontSize: 24, fontWeight: "700", marginBottom: 16, color: "#333" },

  inputRow: { flexDirection: "row", alignItems: "center", marginBottom: 16 },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    marginRight: 10,
    borderRadius: 8,
    backgroundColor: "#fff",
  },

  filterContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    backgroundColor: "#f9f9f9",
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#eee",
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: "600",
    marginRight: 10,
    color: "#555",
  },
  pickerWrapper: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    backgroundColor: "#fff",
    justifyContent: "center",
  },
  picker: {
    height: 50, 
    width: "100%",
  },

  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  itemText: { fontSize: 16, color: "#333" },
  doneText: { textDecorationLine: "line-through", color: "#aaa" },
  dateText: { fontSize: 12, color: "green", marginTop: 4 },
  actionButtons: { flexDirection: "row" },
});