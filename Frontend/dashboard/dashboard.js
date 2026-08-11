// Select elements
const sideMenu = document.querySelector("aside");
const menuBtn = document.querySelector("#menu-btn");
const closeBtn = document.querySelector("#close-btn");
const themeToggler = document.querySelector(".theme-toggler");
const lightIcon = document.querySelector("#light-icon");
const darkIcon = document.querySelector("#dark-icon");

// Show sidebar (mobile)
menuBtn.addEventListener("click", () => {
  sideMenu.classList.add("show");
});

// Close sidebar (mobile)
closeBtn.addEventListener("click", () => {
  sideMenu.classList.remove("show");
});

// Change theme
themeToggler.addEventListener("click", () => {
  document.body.classList.toggle("dark-theme-variables");
  lightIcon.classList.toggle("active");
  darkIcon.classList.toggle("active");
});
