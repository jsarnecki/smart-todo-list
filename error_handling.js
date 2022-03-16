// $(document).ready(function() {

//   loadList();
//   $('form').on('submit', function(event) {
//     event.preventDefault();
//     let data = $('form').serialize();
//     let inputVal = $('user-input').val();
//     const error = $('errorname');
//     if (inputVal.length <= 0) {
//       error.html("Form Empty!");
//       error.slidedown();
//       return;
//     } else if (inputVal.length >5) {
//       error.html("Too Many Characters");
//       error.slideDown();
//       return;
//     } else {
//       error.slideUp();
//       $.ajax({
//         type: "POST",
//         url: "/api/tasks/new",
//         data: data,
//       })
//         .then(function() {
//           loadList();
//           $('user-input').val('');
//         });
//     }
//   })
// })
