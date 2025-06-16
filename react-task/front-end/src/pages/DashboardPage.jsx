import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

function DashboardPage() {
  const [habits, setHabits] = useState([]);
  const [newHabit, setNewHabit] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");

  useEffect(() => {
    fetch("http://localhost:3000/api/habits", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => setHabits(data));
  }, []);

  const handleAddHabit = async () => {
    if (!newHabit.trim()) return;

    const res = await fetch("http://localhost:3000/api/habits", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        name: newHabit,
        userId: "00889e5c-364c-4be6-b9f7-f1a04b096444",
      }),
    });

    if (res.ok) {
      const added = await res.json();
      setHabits((prev) => [...prev, added]);
      setNewHabit("");
    } else {
      console.error("Failed to add habit");
    }
  };

  const handleToggleComplete = async (id, completed) => {
    await fetch(`http://localhost:3000/api/habits/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ completed }),
    });

    setHabits((prev) =>
      prev.map((h) => (h.id === id ? { ...h, completed } : h))
    );
  };

  const handleEdit = (habit) => {
    setEditingId(habit.id);
    setEditName(habit.name);
  };

  const handleSaveEdit = async (id) => {
    await fetch(`http://localhost:3000/api/habits/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ name: editName }),
    });

    setHabits((prev) =>
      prev.map((h) => (h.id === id ? { ...h, name: editName } : h))
    );
    setEditingId(null);
    setEditName("");
  };

  const handleDelete = async (id) => {
    await fetch(`http://localhost:3000/api/habits/${id}`, {
      method: "DELETE",
      credentials: "include",
    });

    setHabits((prev) => prev.filter((h) => h.id !== id));
  };

  const handleLogout = async () => {
    await fetch("http://localhost:3000/api/auth/logout", {
      method: "POST",
      credentials: "include",
    });
    window.location.href = "/login";
  };

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold">Dashboard</h1>
        <Button variant="default" size="sm" onClick={handleLogout}>
          Logout
        </Button>
      </div>

      {/* Input section */}
      <div className="space-y-3">
        <Label htmlFor="newHabit" className="text-sm">
          Add a new habit
        </Label>
        <div className="flex items-center gap-3">
          <Input
            id="newHabit"
            value={newHabit}
            onChange={(e) => setNewHabit(e.target.value)}
            placeholder="e.g. Read 10 pages"
            className="text-sm w-80"
          />
          <Button onClick={handleAddHabit} size="sm">
            Add
          </Button>
        </div>
      </div>
  
      {/* Cards */}
      <div className="mt-6 grid grid-cols-4 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-5">
        {habits.map((habit) => (
          <Card
            key={habit.id}
            className="h-36 p-2 flex flex-col justify-between"
          >
            <div className="flex items-start gap-2 text-sm">
              <input
                type="checkbox"
                checked={habit.completed}
                onChange={() =>
                  handleToggleComplete(habit.id, !habit.completed)
                }
              />
              {editingId === habit.id ? (
                <Input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="text-sm px-2 py-1 h-6"
                />
              ) : (
                <span
                  className={`text-sm break-words ${
                    habit.completed ? "line-through text-gray-500" : ""
                  }`}
                >
                  {habit.name}
                </span>
              )}
            </div>

            <div className="flex justify-end gap-1 mt-auto">
              {editingId === habit.id ? (
                <Button
                  onClick={() => handleSaveEdit(habit.id)}
                  size="sm"
                  className="px-2 py-1 text-sm"
                >
                  💾
                </Button>
              ) : (
                <Button
                  onClick={() => handleEdit(habit)}
                  size="sm"
                  className="px-2 py-1 text-sm"
                >
                  ✏️
                </Button>
              )}
              <Button
                onClick={() => handleDelete(habit.id)}
                size="sm"
                variant="destructive"
                className="px-2 py-1 text-sm"
              >
                🗑
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default DashboardPage;
