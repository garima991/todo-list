
function startApp(){
    const input = document.getElementById("new-task-input");
    const addButton = document.getElementById("add-btn");
    const list = document.getElementById("task-list");

    document.getElementById("add-btn").addEventListener("click", () => {
        // console.log(input.value);
        addTaskToList(input.value);
        input.value = "";
    });

    function syncTasks(){
        const currTask = list.querySelectorAll(".todo-label");
        const taskList = localStorage.getItem("todo-task") ? JSON.parse(localStorage.getItem("todo-task")) : [];
        currTask.forEach((task) => {
            const label = task.querySelector(".task").innerText;
            const completed = task.querySelector(".todo-check").className.includes("completed");
            taskList.push({taskName: label, completionStatus: completed});
            // taskList.push({label, completed});
        });

        localStorage.setItem("todo-task", JSON.stringify(taskList));
        console.log("saved to local");
    }


    // let item1 = {
    //     inputValue:"My Task",
    //     completed: false
    // }

    function addTaskToList(inputValue, completed = false){
        if(inputValue){
            console.log("Add Task", inputValue);

            const li = document.createElement("li");
            li.classList.add("todo-label");
            const para = document.createElement("p");
            para.classList.add("task");
            para.innerText = inputValue;

            const div = document.createElement("div");
            div.classList.add("status");
            const checkTask = document.createElement("img");
            checkTask.classList.add("todo-check");

            checkTask.src = "./assets/unchecked.svg";
            checkTask.addEventListener("click", () => {
                checkTask.classList.toggle("completed");
                para.style.textDecoration = "line-through";
                para.style.color = "grey";
                checkTask.src =  "assets/checked.svg";
                syncTasks();
            });

            const removeTask = document.createElement("img");
            removeTask.classList.add("todo-remove");
            removeTask.src = "./assets/trash.svg";
            removeTask.addEventListener("click", () => {
                li.remove();
                // syncTasks();
            });

            div.append(checkTask, removeTask);
            li.append(para, div);
            list.appendChild(li);
            console.log("ADDED !");
            syncTasks();
        }
        else{
            alert("ADD TASK !");
        }
        
    }

    const previousTasks = localStorage.getItem("todo-task")? 
        JSON.parse(localStorage.getItem("todo-task")) : [];
        previousTasks.forEach((task) => { addTaskToList(task.taskName, task.completionStatus)});
    syncTasks();
}

startApp();