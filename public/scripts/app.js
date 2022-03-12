// Client facing scripts here

const renderList = (tasks) => {
  for (task of tasks) {
    $("#todo-list").append(makeListTask(task));
  }
}

const makeListTask = (taskInfo) => {
  const $task = `<header>${taskInfo.description} (${"to " + taskInfo.category})</header>`;
  return $task;
}

const loadList = () => {
  $.get("/api/tasks/")
    .then((data) => {
      console.log(data.tasks);
      renderList(data.tasks);
    })
}

$(document).ready(function() {
  loadList();

  // $("#create-task").submit(function(event) {
  //   $.post("/api/tasks/")
  //     .then((data) => {
  //       console.log(data);
  //       renderList(data.tasks.slice(-1));
  //     })
  // });
});
