const sign_in_btn = document.querySelector("#sign-in-btn");
const sign_up_btn = document.querySelector("#sign-up-btn");
const container = document.querySelector(".container");

sign_up_btn.addEventListener("click", () => {
  container.classList.add("sign-up-mode");
});

sign_in_btn.addEventListener("click", () => {
  container.classList.remove("sign-up-mode");
});

// ++++++++++++++++++

$(document).ready(function () {
  $(".ssubtn").click(function (event) {
    event.preventDefault();
    $(".sign-in-form1").hide();
    $(".sReg-form").show();
  });
  $(".lsubtn").click(function (event) {
    event.preventDefault();
    $(".sign-in-form1, .sReg-form").toggle();
  });
});

// ***************************
$(document).ready(function () {
  $(".fsubtn").click(function (event) {
    event.preventDefault();
    $(".sign-up-form1").hide();
    $(".fReg-form").show();
  });
  $(".flsubtn").click(function (event) {
    event.preventDefault();
    $(".sign-up-form1, .fReg-form").toggle();
  });
});
