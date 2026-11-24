
import { auth, db } from "./firebaseConfig.js";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

const slot = document.getElementById("navbar-placeholder");

const svg = (paths) =>
  `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}</svg>`;

const ICON = {
  home: svg('<path d="M3 10.5 12 3l9 7.5V21h-6v-6H9v6H3z"/>'),
  calendar: svg('<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>'),
  inbox: svg('<path d="M3 13 6 5h12l3 8v6H3z"/><path d="M3 13h5l1 3h6l1-3h5"/>'),
  user: svg('<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.6-7 8-7s8 3 8 7"/>')
};

const TABS = {
  student: [
    { href: "search.html", label: "Home", icon: ICON.home, pages: ["search.html", "filter.html", "viewprofile.html"] },
    { href: "booking.html", label: "Bookings", icon: ICON.calendar, pages: ["booking.html", "payment.html", "cardpay.html", "connection.html"] },
    { href: "myprofile.html", label: "Profile", icon: ICON.user, pages: ["myprofile.html", "profile.html"] }
  ],
  tutor: [
    { href: "inbox.html", label: "Inbox", icon: ICON.inbox, pages: ["inbox.html"] },
    { href: "myprofile.html", label: "Profile", icon: ICON.user, pages: ["myprofile.html", "profile.html"] }
  ]
};

function renderNav(role) {
  if (!slot) return;
  const here = (location.pathname.split("/").pop() || "index.html").toLowerCase();
  slot.innerHTML = `<nav class="bottom-nav" aria-label="Main">${TABS[role].map((tab) => {
    const active = tab.pages.includes(here);
    return `<a href="${tab.href}" class="${active ? "active" : ""}"${active ? ' aria-current="page"' : ""}>${tab.icon}<span>${tab.label}</span></a>`;
  }).join("")}</nav>`;
}

onAuthStateChanged(auth, async (user) => {
  if (!slot || !user) return;
  try {
    const snap = await getDoc(doc(db, "users", user.uid));
    const role = snap.exists() && snap.data()?.role === "tutor" ? "tutor" : "student";
    renderNav(role);
  } catch (err) {
    console.error("Navbar role lookup failed, defaulting to student:", err);
    renderNav("student");
  }
});