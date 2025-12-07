import { useState, useEffect } from 'react';
import { Todo } from '../types/Todo';
import './TodoList.css';

const API_BASE_URL = 'http://localhost:8080/api/todos';

export default function TodoList() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [editingId, setEditingId] = useState<string | number | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');

  // Fetch all todos on component mount
  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    try {
      const response = await fetch(API_BASE_URL);
      if (response.ok) {
        const data = await response.json();
        setTodos(data);
      }
    } catch (error) {
      console.error('Error fetching todos:', error);
    }
  };

  // CREATE
  const addTodo = async () => {
    if (!title.trim()) {
      alert('Please enter a title');
      return;
    }

    try {
      const newTodo = {
        title,
        description,
        completed: false,
      };

      const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newTodo),
      });

      if (response.ok) {
        const createdTodo = await response.json();
        setTodos([...todos, createdTodo]);
        setTitle('');
        setDescription('');
      } else {
        alert('Failed to add todo');
      }
    } catch (error) {
      console.error('Error adding todo:', error);
      alert('Error adding todo');
    }
  };

  // READ - display todos (handled in render)

  // UPDATE
  const updateTodo = async (id: string | number) => {
    if (!editTitle.trim()) {
      alert('Please enter a title');
      return;
    }

    try {
      const numericId = typeof id === 'string' ? parseInt(id, 10) : id;
      const updatedData = {
        title: editTitle,
        description: editDescription,
      };

      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData),
      });

      if (response.ok) {
        const updatedTodo = await response.json();
        setTodos(
          todos.map((todo) =>
            todo.id === numericId ? updatedTodo : todo
          )
        );
        setEditingId(null);
        setEditTitle('');
        setEditDescription('');
      } else {
        alert('Failed to update todo');
      }
    } catch (error) {
      console.error('Error updating todo:', error);
      alert('Error updating todo');
    }
  };

  const startEdit = (todo: Todo) => {
    setEditingId(String(todo.id));
    setEditTitle(todo.title);
    setEditDescription(todo.description);
  };

  // DELETE
  const deleteTodo = async (id: string | number) => {
    if (confirm('Are you sure you want to delete this todo?')) {
      try {
        const numericId = typeof id === 'string' ? parseInt(id, 10) : id;
        const response = await fetch(`${API_BASE_URL}/${id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          setTodos(todos.filter((todo) => todo.id !== numericId));
        } else {
          alert('Failed to delete todo');
        }
      } catch (error) {
        console.error('Error deleting todo:', error);
        alert('Error deleting todo');
      }
    }
  };

  // TOGGLE COMPLETE
  const toggleComplete = async (id: string | number) => {
    try {
      const numericId = typeof id === 'string' ? parseInt(id, 10) : id;
      const todo = todos.find((t) => t.id === numericId);
      if (!todo) return;

      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          completed: !todo.completed,
        }),
      });

      if (response.ok) {
        const updatedTodo = await response.json();
        setTodos(
          todos.map((t) =>
            t.id === numericId ? updatedTodo : t
          )
        );
      }
    } catch (error) {
      console.error('Error toggling todo:', error);
    }
  };

  return (
    <div className="todo-container">
      <h1>My Todo List</h1>

      {/* Add Todo Form */}
      <div className="form-section">
        <h2>Add New Todo</h2>
        <div className="form-group">
          <input
            type="text"
            placeholder="Enter todo title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') addTodo();
            }}
          />
          <textarea
            placeholder="Enter description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
          ></textarea>
          <button onClick={addTodo} className="btn btn-primary">
            Add Todo
          </button>
        </div>
      </div>

      {/* Todos List */}
      <div className="todos-section">
        <h2>Todos ({todos.length})</h2>
        {todos.length === 0 ? (
          <p className="empty-message">No todos yet. Add one to get started!</p>
        ) : (
          <div className="todos-list">
            {todos.map((todo) => (
              <div key={todo.id} className={`todo-item ${todo.completed ? 'completed' : ''}`}>
                {editingId === String(todo.id) ? (
                  // Edit Mode
                  <div className="edit-mode">
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                    />
                    <textarea
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      rows={2}
                    ></textarea>
                    <div className="action-buttons">
                      <button
                        onClick={() => updateTodo(String(todo.id))}
                        className="btn btn-success"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => {
                          setEditingId(null);
                          setEditTitle('');
                          setEditDescription('');
                        }}
                        className="btn btn-cancel"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  // View Mode
                  <div className="view-mode">
                    <div className="todo-content">
                      <input
                        type="checkbox"
                        checked={todo.completed}
                        onChange={() => toggleComplete(String(todo.id))}
                        className="todo-checkbox"
                      />
                      <div className="todo-text">
                        <h3>{todo.title}</h3>
                        {todo.description && <p>{todo.description}</p>}
                        <small>Created: {todo.createdAt ? new Date(todo.createdAt).toLocaleDateString() : 'N/A'}</small>
                      </div>
                    </div>
                    <div className="action-buttons">
                      <button
                        onClick={() => startEdit(todo)}
                        className="btn btn-edit"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteTodo(String(todo.id))}
                        className="btn btn-danger"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
