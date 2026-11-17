# Tutor Match

## Overview
Tutor Match is a web app that matches students with the right tutors for their goals. Students search and filter tutors, view a tutor's profile and send a session request. Tutors set up a profile and answer requests.

Built for COMP 1800 using user-centred design and agile (Trello) project management.

## Features
- Sign up as a student or a tutor and set up a profile
- Search tutors by name or subject
- Filter by subject, age group, price and distance
- View a tutor's profile and request a session
- Tutors accept or decline requests in their inbox

## Technologies Used
- HTML, CSS, JavaScript
- Bootstrap 5
- Vite
- Firebase Authentication and Firestore

## Usage
1. Clone the repository.
2. Run `npm install` in the project folder.
3. Run `npm run dev`.
4. Open the address shown in the terminal (usually `http://localhost:5173`).

## Project Structure
```
1800_202630_BBY-09/
├── css/        styles
├── js/         page scripts and Firebase setup
├── images/
├── index.html  landing page
├── login.html, signup.html, profile.html, myprofile.html
├── search.html, filter.html, viewprofile.html
├── booking.html
├── package.json
└── README.md
```

## Contributors
- **Bertha Minondo** - search and filter
- **Jonathan Volsky** - sign-up, profiles and navigation
- **Pratham Lamba** - booking requests and tutor inbox

## Acknowledgments
- Code snippets were adapted from [MDN Web Docs](https://developer.mozilla.org/) and [Stack Overflow](https://stackoverflow.com/).
- UI built with [Bootstrap](https://getbootstrap.com/) and [Bootstrap Icons](https://icons.getbootstrap.com/).
- Sample tutors are made-up demo data.
