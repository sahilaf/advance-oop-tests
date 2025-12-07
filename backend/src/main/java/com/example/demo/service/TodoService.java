package com.example.demo.service;

import com.example.demo.model.Todo;
import com.example.demo.repository.TodoRepository;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class TodoService {

    private final TodoRepository todoRepository;

    public TodoService(TodoRepository todoRepository) {
        this.todoRepository = todoRepository;
    }

    // CREATE
    public Todo createTodo(Todo todo) {
        return todoRepository.save(todo);
    }

    // READ
    public List<Todo> getAllTodos() {
        return todoRepository.findAll();
    }

    public Optional<Todo> getTodoById(Long id) {
        return todoRepository.findById(id);
    }

    // UPDATE
    public Todo updateTodo(Long id, Todo todoDetails) {
        return todoRepository.findById(id)
                .map(todo -> {
                    if (todoDetails.getTitle() != null) {
                        todo.setTitle(todoDetails.getTitle());
                    }
                    if (todoDetails.getDescription() != null) {
                        todo.setDescription(todoDetails.getDescription());
                    }
                    if (todoDetails.getCompleted() != null) {
                        todo.setCompleted(todoDetails.getCompleted());
                    }
                    return todoRepository.save(todo);
                })
                .orElseThrow(() -> new IllegalArgumentException("Todo not found with id: " + id));
    }

    // DELETE
    public void deleteTodo(Long id) {
        if (!todoRepository.existsById(id)) {
            throw new IllegalArgumentException("Todo not found with id: " + id);
        }
        todoRepository.deleteById(id);
    }

    // DELETE ALL
    public void deleteAllTodos() {
        todoRepository.deleteAll();
    }
}
