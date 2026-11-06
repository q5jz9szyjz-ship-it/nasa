
// NASA Space Explorer

// Put your NASA API key here
const apiKey = "DEMO_KEY";

const form = document.getElementById("dateForm");
const startDate = document.getElementById("startDate");
const endDate = document.getElementById("endDate");
const gallery = document.getElementById("gallery");
const loading = document.getElementById("loading");
const error = document.getElementById("error");

const modal = document.getElementById("modal");
const modalImage = document.getElementById("modalImage");
const modalTitle = document.getElementById("modalTitle");
const modalDate = document.getElementById("modalDate");
const modalText = document.getElementById("modalText");

let pictures = [];

// Set default dates to the last 9 days
let today = new Date();
today.setHours(12, 0, 0, 0);

let firstDay = new Date(today);
firstDay.setDate(today.getDate() - 8);

function dateText(date) {
  return date.getFullYear() + "-" +
    String(date.getMonth() + 1).padStart(2, "0") + "-" +
    String(date.getDate()).padStart(2, "0");
}

startDate.value = dateText(firstDay);
endDate.value = dateText(today);

startDate.min = "1995-06-16";
endDate.min = "1995-06-16";
startDate.max = dateText(today);
endDate.max = dateText(today);

// When the button is clicked
form.addEventListener("submit", function(event) {
  event.preventDefault();

  let start = startDate.value;
  let end = endDate.value;

  if (start > end) {
    error.textContent = "Start date must be before end date.";
    return;
  }

  let startTime = new Date(start + "T12:00:00");
  let endTime = new Date(end + "T12:00:00");

  let days = Math.round(
    (endTime - startTime) / 86400000
  ) + 1;

  // Rubric requires 9 consecutive days
  if (days !== 9) {
    error.textContent =
      "Please select exactly 9 consecutive days.";
    return;
  }

  getPictures(start, end);
});

// Get data from NASA
async function getPictures(start, end) {
  gallery.innerHTML = "";
  error.textContent = "";
  loading.hidden = false;

  let url = "https://api.nasa.gov/planetary/apod" +
    "?api_key=" + apiKey +
    "&start_date=" + start +
    "&end_date=" + end;

  try {
    let response = await fetch(url);

    if (!response.ok) {
      throw new Error("NASA API request failed.");
    }

    let data = await response.json();

    if (!Array.isArray(data) || data.length !== 9) {
      throw new Error("NASA did not return all 9 days.");
    }

    pictures = data;

    pictures.sort(function(a, b) {
      return a.date.localeCompare(b.date);
    });

    showPictures();

  } catch (problem) {
    error.textContent =
      "Something went wrong. Check your API key or dates.";
    console.log(problem);
  }

  loading.hidden = true;
}

// Display gallery
function showPictures() {
  gallery.innerHTML = "";

  pictures.forEach(function(picture, index) {
    let card = document.createElement("div");
    card.className = "card";
    card.tabIndex = 0;
    card.setAttribute("role", "button");
    card.setAttribute("aria-label", "View " + picture.title);

    if (picture.media_type === "image") {
      let image = document.createElement("img");
      image.src = picture.url;
      image.alt = picture.title;
      card.appendChild(image);
    } else {
      let video = document.createElement("div");
      video.className = "video-card";
      video.textContent = "▶ Space Video";
      card.appendChild(video);
    }

    let title = document.createElement("h3");
    title.textContent = picture.title;

    let date = document.createElement("p");
    date.textContent = picture.date;

    card.appendChild(title);
    card.appendChild(date);

    card.addEventListener("click", function() {
      openModal(index);
    });

    card.addEventListener("keydown", function(event) {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openModal(index);
      }
    });

    gallery.appendChild(card);
  });
}

// Open picture details
function openModal(index) {
  let picture = pictures[index];

  modalImage.innerHTML = "";
  modalTitle.textContent = picture.title;
  modalDate.textContent = picture.date;
  modalText.textContent = picture.explanation;

  if (picture.media_type === "image") {
    let image = document.createElement("img");
    image.src = picture.hdurl || picture.url;
    image.alt = picture.title;
    modalImage.appendChild(image);

  } else {
    // Use a working video link instead of a broken image
    let link = document.createElement("a");
    link.href = picture.url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = "Watch NASA Video";
    link.style.color = "white";
    modalImage.appendChild(link);
  }

  modal.hidden = false;
}

// Close the modal
document.getElementById("closeButton").addEventListener(
  "click",
  function() {
    modal.hidden = true;
  }
);

modal.addEventListener("click", function(event) {
  if (event.target === modal) {
    modal.hidden = true;
  }
});

document.addEventListener("keydown", function(event) {
  if (event.key === "Escape") {
    modal.hidden = true;
  }
});

// Random space facts
const facts = [
  "The Sun is a star.",
  "Jupiter is the biggest planet in our solar system.",
  "Mars is known as the Red Planet.",
  "The Moon has less gravity than Earth.",
  "Saturn has rings made mostly of ice.",
  "Neptune is the farthest planet from the Sun.",
  "The Milky Way contains billions of stars.",
  "Venus is the hottest planet in our solar system."
];

function randomFact() {
  let number = Math.floor(Math.random() * facts.length);
  document.getElementById("fact").textContent = facts[number];
}

document.getElementById("factButton").addEventListener(
  "click",
  randomFact
);

randomFact();

// Load pictures when the page opens
getPictures(startDate.value, endDate.value);
