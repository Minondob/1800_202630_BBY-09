# Tutor Match

BCIT COMP 1800 project, Team BBY-09 (202630).

Tutor Match is a web app that matches students with tutors for their specific goals. Students search and filter tutors, view a tutor's profile, and send a booking request. Tutors set up a profile with their subject, hourly rate and age groups, and review incoming requests in their inbox.

## Features

- Sign up as a **student** or a **tutor**, log in and log out with Firebase Authentication
- Profile setup: avatar upload (resized in the browser), display name choice, bio
- Tutor profile fields: subject, hourly rate, age groups
- Search tutors by name or subject, with live results as you type
- Filter by subject group, age group, maximum price and distance
- Tutor profile page with rating, subject, rate and age groups
- Booking request form and a list of the student's past requests
- Tutor inbox with Accept and Decline
- Delete account (asks for your password, then removes your profile and booking requests)
- Bottom navigation bar shared across pages

## Technologies

- HTML, CSS, JavaScript (ES modules)
- [Bootstrap 5](https://getbootstrap.com/) and Bootstrap Icons
- [Vite](https://vitejs.dev/) for the dev server
- [Firebase](https://firebase.google.com/) Authentication and Cloud Firestore

## Getting started

1. Clone the repository and open the folder.
2. Install dependencies: `npm install`
3. Start the dev server: `npm run dev`
4. Open the address the terminal prints, usually `http://localhost:5173/`.

### Firebase setup

The app uses the team Firebase project configured in `js/firebaseConfig.js`. To use your own project, replace the config values and in the Firebase console:

- Authentication, Sign-in method: enable **Email/Password**
- Build, Firestore Database: create a database (test mode is fine while developing; it expires after 30 days)

The Firebase web config is meant to be public. Access is protected by the Firestore security rules, not by hiding the keys.

### Sample data

To load 10 sample tutors into the `users` collection, open `search.html?seed=1` once.

## Pages

| Page | Purpose |
|---|---|
| `index.html` | Landing page |
| `main.html` | Choose Student or Tutor before signing up |
| `signup.html` | Create an account |
| `login.html` | Log in and log out |
| `profile.html` | Set up or edit your profile |
| `myprofile.html` | View your own profile, log out, delete account |
| `search.html` | Search tutors |
| `filter.html` | Choose filters for the search |
| `viewprofile.html` | A tutor's profile (`?id=<tutor id>`) |
| `booking.html` | Send a booking request and see past requests |
| `inbox.html` | Tutor inbox for booking requests |
| `connection.html` | Choose how to connect after a request is accepted |

## Data (Firestore)

- `users/{uid}`: `firstName`, `lastName`, `email`, `role` (`student` or `tutor`), `username`, `bio`, `avatar`, `profileComplete`. Tutors also have `subject`, `hourlyRate`, `ageGroups`.
- `bookingRequests/{id}`: the form details, the student's `uid` and `email`, and a `status` (pending, accepted or declined).

## Project structure

```
.
├── index.html, main.html, signup.html, login.html, profile.html, myprofile.html
├── search.html, filter.html, viewprofile.html, booking.html, inbox.html, connection.html
├── css/            style.css, tutors.css
└── js/             firebaseConfig.js, navbar.js, subjects.js, and one script per page
```

## Known limitations

- Messaging is not built yet (the Messages icon in the navbar is disabled)
- Ratings are display-only; there is no way to leave a rating yet
- Firestore is in test mode and needs proper security rules before real use

## Team

- Jonathan: sign-up, profile setup, tutor profile page, navbar, delete account
- Pratham Lamba: booking request form, past requests, inbox
- Bertha Minondo: search and filter pages, shared tutor data

## Links

- [Trello board](https://trello.com/b/2nlmIdwu/comp1800bby-9projectboard)
- [GitHub repository](https://github.com/Minondob/1800_202630_BBY-09)
