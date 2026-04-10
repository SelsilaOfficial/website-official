// === LOGIKA DYNAMIC MOUSE FOLLOW GRADIENT ===

// 1. Ambil elemen yang ingin diberi efek (home-marquee)
// const containerElement = document.querySelector(".container");

// 2. Tambahkan event listener untuk pergerakan mouse
// document.addEventListener("mousemove", (event) => {
// Hitung posisi mouse relatif terhadap viewport (persen)

// Posisi X (Horizontal): event.clientX (0 sampai lebar viewport)
// Posisi Y (Vertical): event.clientY (0 sampai tinggi viewport)

// Kita ubah nilainya menjadi persentase (0% - 100%)
// const mouseX = (event.clientX / window.innerWidth) * 100;
// const mouseY = (event.clientY / window.innerHeight) * 100;

// Terapkan nilai ke CSS Variable pada elemen home-marquee
//     containerElement.style.setProperty('--mouse-x', `${mouseX}%`);
//     containerElement.style.setProperty('--mouse-y', `${mouseY}%`);
// });

// === LOGIKA SPLASH SCREEN ===
window.addEventListener("load", () => {
  const splashScreen = document.getElementById("splash-screen");

  // Atur delay sebelum splash screen hilang (misal: 3 detik)
  setTimeout(() => {
    splashScreen.classList.add("fade-out");

    // Opsional: Setelah hilang, hapus elemen dari DOM (jika perlu)
    setTimeout(() => {
      splashScreen.style.display = "none";
    }, 500); // 500ms adalah durasi transisi CSS
  }, 3000); // Tahan selama 3 detik
});

const hamburger = document.querySelector(".hamburger");
const navUl = document.querySelector(".nav ul");
// Cari semua link (<a>) di dalam menu
const navLinks = document.querySelectorAll(".nav ul li a");

// Fungsi untuk Toggle Menu (Sudah ada)
hamburger.addEventListener("click", () => {
  // Toggle class 'active' pada menu dan ikon hamburger
  navUl.classList.toggle("active");
  hamburger.classList.toggle("active");
});

// Fungsi Baru: Menutup menu ketika link diklik
navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    // Hapus class 'active' dari menu dan ikon hamburger
    navUl.classList.remove("active");
    hamburger.classList.remove("active");
  });
});

function openAccordion(header) {
  const card = header.parentElement;
  const allCards = document.querySelectorAll(".card-accordion");

  allCards.forEach((c) => {
    if (c !== card) c.classList.remove("active");
  });

  card.classList.toggle("active");
}

const bankSlides = document.querySelectorAll(".slide-bank");
let currentBankSlide = 0;

function showBankSlide(slideNumber) {
  bankSlides.forEach((s) => s.classList.remove("active"));
  bankSlides[slideNumber].classList.add("active");
}

function autoBankSlide() {
  currentBankSlide = (currentBankSlide + 1) % bankSlides.length;
  showBankSlide(currentBankSlide);
}

setInterval(autoBankSlide, 5000);

const ecoTrack = document.querySelector(".eco-track");
const ecoCards = document.querySelectorAll(".card-eco");
let ecoSlideIndex = 0;

function autoEcoSlide() {
  ecoSlideIndex = (ecoSlideIndex + 1) % ecoCards.length;
  updateEcoSlider();
}

function updateEcoSlider() {
  ecoTrack.style.transform = `translateX(-${ecoSlideIndex * 100}%)`;
}

setInterval(autoEcoSlide, 4000);

const entSlides = document.querySelectorAll(".entertaiment-slide > div");
let entPosition = 0;

function entShowSlide(num) {
  entSlides.forEach((sl) => sl.classList.remove("active"));
  entSlides[num].classList.add("active");
}

function entAutoSlide() {
  entPosition = (entPosition + 1) % entSlides.length;
  entShowSlide(entPosition);
}

// Tampilkan slide pertama
entShowSlide(entPosition);

// Auto slide tiap 5 detik
setInterval(entAutoSlide, 5000);

const prdSlides = document.querySelectorAll(".president-slide > div");
let prdPosition = 0;

function prdShowSlide(num) {
  prdSlides.forEach((s) => s.classList.remove("active"));
  prdSlides[num].classList.add("active");
}

function prdAutoSlide() {
  prdPosition = (prdPosition + 1) % prdSlides.length;
  prdShowSlide(prdPosition);
}

// tampilkan slide pertama
prdShowSlide(prdPosition);

// auto slide setiap 5 detik
setInterval(prdAutoSlide, 5000);

const form = document.getElementById("contactForm");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const successMsg = document.getElementById("successMsg");
  const errorMsg = document.getElementById("errorMsg");

  // ambil data input
  const data = {
    name: document.getElementById("name").value,
    email: document.getElementById("email").value,
    message: document.getElementById("message").value,
  };

  // kirim ke Formspree dengan JSON
  try {
    const response = await fetch("https://formspree.io/f/xldvokjz", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(data),
    });

    if (response.ok) {
      successMsg.style.display = "block";
      errorMsg.style.display = "none";
      form.reset();
    } else {
      throw new Error("Formspree request failed");
    }
  } catch (error) {
    successMsg.style.display = "none";
    errorMsg.style.display = "block";
  }
});

