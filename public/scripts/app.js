// Client facing scripts here

const renderList = (tasks) => {
  for (task of tasks) {
    $("#todo-list").append(makeListTask(task));
  }
}

const makeListTask = (taskInfo) => {
  const $task = `
  <article>
    <input type="checkbox" name="complete-task">
    <label name="${taskInfo.id}">${taskInfo.description}</label>
    <button name="change-category">${"to " + taskInfo.category}</button>
    <button name="delete-task">Delete</button>
  </article>
  `;
  return $task;
}

const loadList = () => {
  $.get("/api/tasks/")
    .then((data) => {
      renderList(data.tasks);
    })
}

$(document).ready(function() {
  loadList();

  $(document).on("click", "[name='delete-task']", function() {
    const task_id = $(this).parent().children("label").attr("name");

    // remove from db
    $.post(`/api/tasks/delete/${task_id}`)
      .then((res) => {
        $(this).closest("article").remove();
      })
  });

  $(document).on("click", "[name='change-category']", function() {
    const task_id = $(this).parent().children("label").attr("name");
    $.post(`/api/tasks/update/${task_id}`);
  });

  // $("#create-task").submit(function(event) {
  //   $.post("/api/tasks/")
  //     .then((data) => {
  //       console.log(data);
  //       renderList(data.tasks.slice(-1));
  //     })
  // });
});
