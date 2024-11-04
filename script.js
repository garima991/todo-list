const input = document.getElementById("new-task-input");
const addButton = document.getElementById("add-btn");
const list = document.getElementById("task-list");


addButton.addEventListener("click", () => {
    addTaskToList(input.value);
    input.value = "";
});

document.addEventListener("keydown", (event) => {
    if(event.code === "Enter"){
        addTaskToList(input.value);
        input.value = "";
    }
})

function syncTasks() {
    const currTaskElements = list.querySelectorAll(".todo-label");
    const newTaskList = [];

    //tasks from the DOM
    currTaskElements.forEach((taskElement) => {
        const label = taskElement.querySelector(".task").innerText;
        const completed = taskElement.querySelector(".todo-check").classList.contains("completed");
        newTaskList.push({ taskName: label, completionStatus: completed });
    });

    const storedTaskList = JSON.parse(localStorage.getItem("todo-task")) || [];

    // Update local storage only if there are changes
    if (JSON.stringify(newTaskList) !== JSON.stringify(storedTaskList)) {
        localStorage.setItem("todo-task", JSON.stringify(newTaskList));
        console.log("Tasks updated in local storage");
    }
}

function addTaskToList(inputValue, completed = false) {
    inputValue = inputValue.trim();
    if (inputValue) {
        const li = document.createElement("li");
        li.classList.add("todo-label");

        const para = document.createElement("p");
        para.classList.add("task");
        para.innerText = inputValue;

        if (completed) {
            para.style.textDecoration = "line-through";
            para.style.color = "grey";
        }

        const div = document.createElement("div");
        div.classList.add("status");

        const checkTask = document.createElement("img");
        checkTask.classList.add("todo-check");
        checkTask.src = completed ? "./assets/checked.svg" : "./assets/unchecked.svg";
        if (completed) checkTask.classList.add("completed");

        // Toggle completion status
        checkTask.addEventListener("click", () => {
            checkTask.classList.toggle("completed");
            if (checkTask.classList.contains("completed")) {
                para.style.textDecoration = "line-through";
                para.style.color = "grey";
                checkTask.src = "./assets/checked.svg";
            } 
            else {
                para.style.textDecoration = "none";
                para.style.color = "black";
                checkTask.src = "./assets/unchecked.svg";
            }
            syncTasks();
        });

        const removeTask = document.createElement("img");
        removeTask.classList.add("todo-remove");
        removeTask.src = "./assets/trash.svg";

        // Remove task from DOM and update local storage
        removeTask.addEventListener("click", () => {
            li.remove();
            syncTasks();
            console.log("Task deleted and local storage updated");
        });

        div.append(checkTask, removeTask);
        li.append(para, div);
        list.appendChild(li);
        syncTasks();
    } 
    else {
        alert("Please enter a task!");
    }
}

// Load previous tasks from local storage on page load
const previousTasks = JSON.parse(localStorage.getItem("todo-task")) || [];
previousTasks.forEach((task) => addTaskToList(task.taskName, task.completionStatus));