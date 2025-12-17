import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import TodoList from "./components/TodoList";

export default function Index() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <TodoList />
    </SafeAreaView>
  );
}
