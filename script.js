"use strict";

// Stores shortened links
const links = [];

/////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////
// Sticky Navigation
const header = document.querySelector(".header");
// const headerHeight = header.getBoundingClientRect().height;
const heroSection = document.querySelector(".hero-section");
const stickNav = function (entries, observer) {
  const [entry] = entries;

  if (!entry.isIntersecting) {
    header.classList.add("sticky");
  } else {
    header.classList.remove("sticky");
  }
};

const heroSectionObserver = new IntersectionObserver(stickNav, {
  root: null,
  threshold: 0,
  rootMargin: "100px",
});
heroSectionObserver.observe(heroSection);

/////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////
// Reveal section on scroll
const allSections = document.querySelectorAll("section");
const revealSection = function (entries, observer) {
  const [entry] = entries;

  if (!entry.isIntersecting) return;
  entry.target.classList.remove("section--hidden");
  observer.unobserve(entry.target);
};
const sectionObserver = new IntersectionObserver(revealSection, {
  root: null,
  threshold: 0.15,
});
allSections.forEach(function (section) {
  sectionObserver.observe(section);
  section.classList.add("section--hidden");
});

/////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////
// When the form emits the submit event
const form = document.querySelector(".form");
const formInput = document.querySelector(".form__input");
const linksContainer = document.querySelector(".advanced__links");
const errorText = document.querySelector(".invalid-text");
let i = 1;

async function shortenUrl(url) {
  try {
    const response = await fetch(
      `https://api.shrtco.de/v2/shorten?url=${url}`

      // { mode: "no-cors" }
    );
    const data = await response.json();
    return data;
  } catch (error) {
    throw error;
  }
}

form.addEventListener("submit", async function (e) {
  try {
    // Preventing the default behaviour of a button
    e.preventDefault();

    // Reading the input field
    const inputLink = formInput.value;

    // Checking if the input field is empty or not
    if (inputLink.length === 0) {
      formInput.classList.add("invalid");
      errorText.textContent = "Please add a link";
      errorText.classList.remove("hidden");
      return;
    }

    // API Call
    const response = await shortenUrl(inputLink);

    // Checking the response
    if (!response.ok) {
      formInput.classList.add("invalid");
      errorText.textContent = "Invalid input link";
      errorText.classList.remove("hidden");
      return;
    }
    // Extracting the Shortened url from the response
    const shortLink = response.result.full_short_link2;

    // Creating the corresponding html and inserting into the dom
    const html = `<div class="advanced__link">
    <p class="advanced__link__full" data-id=${i}>${inputLink}</p>
    <p class="advanced__link__short" data-id=${i}>${shortLink}</p>
    <button class="btn btn--4 copy--btn" data-id=${i}>Copy</button>
    </div>`;
    linksContainer.insertAdjacentHTML("beforeend", html);
    i++;

    // Clearing the input field and removing the invalid class
    formInput.classList.remove("invalid");
    formInput.value = "";
    formInput.blur();
    errorText.classList.add("hidden");

    // Pushing the newly created html into the links array
    links.push(html);

    // Storing the html in the local storage
    localStorage.setItem("links", JSON.stringify(links));
  } catch (error) {
    console.error(error.message);
  }
});

/////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////
// Copying the shortened url to the clipboard when the copy button is clicked
linksContainer.addEventListener("click", function (e) {
  const btn = e.target.classList.contains("copy--btn") && e.target;
  if (!btn) return;

  const btnId = btn.dataset.id;
  const shortLink = this.querySelector(
    `p.advanced__link__short[data-id="${btnId}"]`
  ).textContent;

  // Copy the text inside the text field
  navigator.clipboard.writeText(shortLink);
  btn.textContent = "Copied!";
  btn.style.backgroundColor = "var(--color-primary-dark-violet)";
});

/////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////
// Extracting the links from local storage when the page loads
window.addEventListener("load", function () {
  const extractedLinks = JSON.parse(localStorage.getItem("links"));

  extractedLinks &&
    extractedLinks.map((link) =>
      linksContainer.insertAdjacentHTML("beforeend", link)
    );
});

/////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////
// Showing the mobile menu when hamburger icon is clicked
const mobileIcon = document.querySelector(".mobile__menu-icon");
const mobileNavigation = document.querySelector(
  ".mobile__navigation-container"
);

mobileIcon.addEventListener("click", function () {
  mobileNavigation.classList.toggle("hidden");
});

/////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////
// Preventing default behaviour of anchor elements
document.querySelectorAll("a").forEach((a) => {
  a.addEventListener("click", (e) => e.preventDefault());
});
