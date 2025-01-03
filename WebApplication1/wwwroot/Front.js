﻿
function getRandom(min, max) {
    return Math.random() * (max - min) + min;
}

//Функция конвертации приоритета в число (для сортировки)
function priorityConvertion(option) {
    switch (option) {
        case "highPriority": return 3;
        case "normalPriority": return 2;
        case "lowPriority": return 1;
        default: return 0;
    }
}
// Получение всех задач
async function getTasks() {
    // отправляет запрос и получаем ответ
    const response = await fetch("/api/tasks", {
        method: "GET",
        headers: { "Accept": "application/json" }
    });
    // если запрос прошел нормально
    if (response.ok === true) {
        // получаем данные
        const tasks = await response.json();
        const rows = document.querySelector("tbody");
        // добавляем полученные элементы в таблицу
        tasks.forEach(task => rows.append(row(task)));

    }
}
// Получение одной задачи
async function getTask(id) {
    const response = await fetch(`/api/tasks/${id}`, {
        method: "GET",
        headers: { "Accept": "application/json" }
    });
    if (response.ok === true) {
        const task = await response.json();
        document.getElementById("addTask").value = "Сохранить";
        document.getElementById("taskId").value = task.id;
        document.getElementById("task").value = task.name;
        document.getElementById("taskDescription").value = task.description;
        let taskPriorities = document.getElementById("taskPriorities");
        for (option of taskPriorities.options) {
            if (option.value == task.priority)
                option.selected = true;
        }
    }
    else {
        // если произошла ошибка, получаем сообщение об ошибке
        const error = await response.json();
        console.log(error.message); // и выводим его на консоль
    }
}
// Добавление задачи
async function createTask(taskName, taskDescription, taskPriority, taskIsCompleted) {
    try {
        if (!taskName) {
            throw new Error("Введите название задачи!");
        }
        const response = await fetch("api/tasks", {
            method: "POST",
            headers: { "Accept": "application/json", "Content-Type": "application/json" },
            body: JSON.stringify({
                Id: Math.floor(getRandom(1, 10000)).toString(),
                Name: taskName,
                Description: taskDescription,
                Priority: taskPriority,
                IsCompleted: taskIsCompleted
            })
        });
        if (response.ok === true) {
            const task = await response.json();
            document.querySelector("tbody").append(row(task));
            sortTasks();
        }
        else {
            const error = await response.json();
            console.log(error.message);
        }
    } catch (error) {
        console.error("Ошибка:", error);
    }
}
// Изменение задачи
async function editTask(taskId, taskName, taskDescription, taskPriority, taskIsCompleted) {
    const response = await fetch(`/api/tasks/${taskId}`, {
        method: "PUT",
        headers: { "Accept": "application/json", "Content-Type": "application/json" },
        body: JSON.stringify({
            Id: taskId,
            Name: taskName,
            Description: taskDescription,
            Priority: taskPriority,
            IsCompleted: taskIsCompleted
        })
    });
    if (response.ok === true) {
        const task = await response.json();
        document.querySelector(`tr[data-rowid="${task.id}"]`).replaceWith(row(task));

    }
    else {
        const error = await response.json();
        console.log(error.message);
    }
}
// Удаление задачи
async function deleteTask(id) {
    const response = await fetch(`/api/tasks/${id}`, {
        method: "DELETE",
        headers: { "Accept": "application/json" }
    });
    if (response.ok === true) {
        const task = await response.json();
        document.querySelector(`tr[data-rowid="${task.id}"]`).remove();
    }
    else {
        const error = await response.json();
        console.log(error.message);
    }
}
async function completeTask(id) {
    try {
        const response = await fetch(`/api/tasks/${id}/complete`, {
            method: "PATCH",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json"
            }
        });

        const result = await response.json();

        // Проверяем успешность операции
        if (!result.success) {
            const confirmDelete = confirm("Задача уже завершена. Хотите удалить её?");

            if (confirmDelete) {
                // Вызываем метод удаления задачи
                await deleteTask(id);
            }
            return;
        }

        const task = result.task;

        // Находим строку задачи
        const taskRow = document.querySelector(`tr[data-rowid="${task.id}"]`);

        // Обновляем строку ПРИНУДИТЕЛЬНО
        taskRow.replaceWith(row(task));

    } catch (error) {
        console.error("Ошибка:", error);
    }
}

//Сортировка по приоритету
async function sortTasks() {
    const response = await fetch("/api/tasks", {
        method: "GET",
        headers: { "Accept": "application/json" }
    });
    if (response.ok === true) {
        const tasks = await response.json();
        const tbody = document.querySelector('tbody');
        const tasksArr = Array.from(tbody.rows);
        // Сортировка задач
        const sortedTasks = tasksArr.sort((a, b) => {
            let cella = a.cells[2].textContent;
            let cellb = b.cells[2].textContent;
            const priorityA = priorityConvertion(cella);
            const priorityB = priorityConvertion(cellb);
            return priorityB - priorityA;
        });

        // Очистка текущей таблицы
        tbody.innerHTML = '';

        // Перерисовка отсортированных задач
        sortedTasks.forEach(task => {
            tbody.appendChild(task);
        });
    }
    else {
        const error = await response.json();
        console.log(error.message);
    }
}

// сброс данных формы после отправки
function reset() {
    document.getElementById("taskId").value = "";
    document.getElementById("task").value = "";
    document.getElementById("taskDescription").value = "";
    let taskPriorities = document.getElementById("taskPriorities");
    taskPriorities.options[0].selected = true;
}
// создание строки для таблицы
function row(task) {
    const tr = document.createElement("tr");
    tr.setAttribute("data-rowid", task.id);

    const nameTd = document.createElement("td");
    nameTd.append(task.name);
    tr.append(nameTd);

    const descTd = document.createElement("td");
    descTd.append(task.description);
    tr.append(descTd);

    const priorityTd = document.createElement("td");
    priorityTd.append(task.priority);
    tr.append(priorityTd);

    const completedTd = document.createElement("td");
    let status = task.isCompleted ? "да" : "нет";
    completedTd.append(status);
    tr.append(completedTd);

    const linksTd = document.createElement("td");

    const editLink = document.createElement("button");
    editLink.append("Изменить");
    editLink.addEventListener("click", async () => await getTask(task.id));
    linksTd.append(editLink);

    const removeLink = document.createElement("button");
    removeLink.append("Удалить");
    removeLink.addEventListener("click", async () => await deleteTask(task.id));
    linksTd.append(removeLink);

    const completeLink = document.createElement("button");
    completeLink.append("Завершить");
    completeLink.addEventListener("click", async () => await completeTask(task.id));
    linksTd.append(completeLink);

    tr.appendChild(linksTd);

    return tr;
}
// сброс значений формы
document.getElementById("reset").addEventListener("click", () => reset());

// отправка формы
document.getElementById("addTask").addEventListener("click", async () => {
    event.preventDefault();
    const id = document.getElementById("taskId").value;
    const name = document.getElementById("task").value;
    const description = document.getElementById("taskDescription").value;
    const priority = document.getElementById("taskPriorities").value;
    let IsCompleted = false;
    if (!name) {
        alert("Введите название задачи!");
        return;
    }
    if (id === "")
        await createTask(name, description, priority, IsCompleted);
    else {
        document.getElementById("addTask").value = "Добавить задачу"
        taskRow = document.querySelector(`tr[data-rowid="${id}"]`);
        if (taskRow.cells[3].textContent === "да")
            IsCompleted = true;
        await editTask(id, name, description, priority, IsCompleted);
    }
    reset();
});
getTasks();