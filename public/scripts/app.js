// Client facing scripts here

const renderList = (tasks) => {
  let appendTask = "";
  for (task of tasks) {
    appendTask += makeListTask(task);
  }
  $("#todo-list").html(appendTask)
}

const icons = {
  eat: "utensils",
  watch: "video",
  read: "book-open",
  buy: "cart-shopping",
  none: "question"
}

const makeListTask = (taskInfo) => {
  let checked = "";
  taskInfo.is_complete ? checked = " checked" : null;

  const $task = `
  <article>
    <div>
      <input type="checkbox" name="complete-task"${checked}>
      <label name="${taskInfo.id}">${taskInfo.description}</label>
    </div>
    <div>
      <button name="change-category"><i class="fa-solid fa-${icons[taskInfo.category]} fa-lg"></i></button>
      <button name="delete-task"><i class="fa-solid fa-trash fa-lg"></i></button>
    </div>
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

$(document).ready(function () {
  loadList();

  $("#errorname").hide();
  $("#username-input").hide();

  $("#swap-button").click(function () {
    let action = $(this).html();

    if (action === "/login") {
      $("#username-input").show();
      action = "/register"
    } else {
      $("#username-input").hide();
      action = "/login"
    }

    const html = action.charAt(1).toUpperCase() + action.slice(2);

    $("#login-register").parent().attr("action", `/api/users${action}`);
    $(this).html(action);
    $("#login-register").html(html);
  });

  $('#task-form').on('submit', function (event) {
    event.preventDefault();
    let data = $('form').serialize();
    let inputVal = $('#user-input').val();
    const error = $('#errorname');
    if (inputVal.length === 0) {
      error.html("form empty");
      error.slideDown();
      return;
    } else if (inputVal.length > 209) {
      error.html("input too long");
      error.slideDown();
      return;
    } else {
      error.slideUp();
      $.ajax({
        type: "POST",
        url: "/api/tasks/new",
        data: data,
      })
        .then(function () {
          loadList();
          $('#user-input').val('');
        });
    }
  })

  $(document).on("click", "[name='delete-task']", function () {
    const task_id = $($(this).closest("article").children("div").children("label")[0]).attr("name");

    $.post(`/api/tasks/delete/${task_id}`)
      .then((res) => {
        $(this).closest("article").remove();
      })
  });

  $(document).on("click", "[name='change-category']", function () {
    const task_id = $($(this).closest("article").children("div").children("label")[0]).attr("name");

    $.post(`/api/tasks/update/category/${task_id}`)
      .then((res) => {
        const currentIcon = $($(this).children("i")).attr("class").slice(12).split(" ").slice(0)[0];

        let index = Object.values(icons).indexOf(currentIcon);
        index + 1 > 4 ? index = 0 : index++;

        const newIcon = `fa-solid fa-${Object.values(icons)[index]} fa-lg`
        $($(this).children("i")).attr("class", newIcon);
      });
  });

  $(document).on("click", "[name='complete-task']", function () {
    const task_id = $(this).parent().children("label").attr("name");
    $.post(`/api/tasks/update/complete/${task_id}`);
  });
});
