# Natours Application

Built using modern technologies: node.js, express, mongoDB, mongoose and friends 😁

## Table of Contents

- [Installing](#installing)
- [Database](#database)
- [Environment Variables](#environment-variables)
- [Deployment](#deployment)
- [Ongoing Task List](#ongoing-task-list)

## Installing

Create NodeJs App and package.json file:

```bash
$ npm init --yes
```

Clone repository from GitHub:

```bash
git clone https://github.com/claudineisbezerra/natour.git
```

Create reference to GitHub REPO and updates in REPO:

```bash
git remote -v
git remote add origin https://github.com/claudineisbezerra/natours-full-app.git
git add .
git commit -m "Description of the change"
git push -u origin master
```

## Database

Local MongDB reference (Version 6.\*):

```js
mongodb://localhost:27017/natours
```

Remote MongDB reference using Atlas Service hosted by AWS (Version 6.\*):

```js
mongodb+srv://[user]:[Password]@[server pefix name].mongodb.net/natours?retryWrites=true
```

## Environment Variables

App Environment Variables:

```js
NODE_ENV=development
PORT=3000
DATABASE=mongodb+srv://<USER>:<PASSWORD>@cluster0.gozquzy.mongodb.net/natours?retryWrites=true
DATABASE_LOCAL=mongodb://localhost:27017/natours
DATABASE_PASSWORD=<PASSWORD>
JWT_USER_ACCESS_SECRET=my-ultra-secure-and-ultra-long-secret
JWT_ACCESS_TOKEN_EXPIRES_IN=90d
JWT_REFRESH_TOKEN_EXPIRES_IN=90

//mailtrap for testing
EMAIL_USERNAME_MAILTRAP=<USER KEY>
EMAIL_PASSWORD_MAILTRAP=<PASSWORD KEY>
EMAIL_HOST_MAILTRAP=smtp.mailtrap.io
EMAIL_PORT_MAILTRAP=2525

//Email shadow for testing
EMAIL_FROM=myemail@mailsac.com

//sendgrid professional email service for testing
SENDGRID_USERNAME=apikey
SENDGRID_PASSWORD=<PASSWORD KEY >

//stripe professional payment for testing
STRIPE_PUBLIC_KEY=<STRIP_KEY>
STRIPE_SECRET_KEY=<STRIP_KEY>
STRIPE_WEBHOOK_SECRET=<STRIP_KEY>
```

## Deployment

Create App on Heroku

```heroku CLI
heroku login
heroku create
heroku logs --tail

heroku ps:scale web=0
heroku ps:scale web=1
heroku ps:scale web=2

heroku open
```

Install App on Heroku

```bash
git remote -v
git push heroku master
```

## Ongoing Task List

- [x] 23/08/2022: Start using express.raw();
- [x] 24/08/2022: Implement restriction that users can only review (Create/Update/Delete) a tour that they have actually booked;
- [x] 24/08/2022: Implement nested booking routes: /tours/:id/bookings and /users/:id/bookings;
- [x] 29/08/2022: Improve tour dates: add a participants and a soldOut field to each date.
      A date then becomes like an instance of the tour.
      Then, when a user books, they need to select one of the dates.
      A new booking will increase the number of participants in the date, until it is booked out (participants > maxGroupSize).
      So, when a user wants to book, you need to check if tour on the selected date is still available;
- [x] Implement advanced authentication features:
      30/08/2022: confirm user email.
      06/09/2022: keep users logged in with refresh tokens.
      09/09/2022: two-factor authentication.
- [x] 09/09/2022: Implement a sign up form, similar to the login form;
- [x] 09/09/2022: Create verification endpoint to activate account;
- [x] 17/09/2022: On the tour detail page, if a user has taken a tour, allow them add a review directly on the website.
      Implement a form for this;
      17/09/2022: On the tour detail page, allow user to book for only not booked dates.
      17/09/2022: On the tour detail page, allow user to review already booked tours and update existing reviews.
      12/09/2022: Show new Tour date format. Show only the tour dates booked by the user.
- [x] Hide the entire booking section on the tour detail page if current user has already booked the tour
      (also prevent duplicate bookings on the model);
      17/09/2022: Booked tour benn presented by date.
- [ ] Implement “like tour” functionality, with favourite tour page;
- [ ] On the user account page, implement the “My Reviews” page, where all reviews are displayed, and a user can edit them.
      (If you know React ⚛ or Vue 🧡, this would be an amazing way to use the Natours API and train your skills!);
- [ ] For administrators, implement all the “Manage” pages, where they can CRUD (create, read, update, delete) tours,
      users, reviews, and bookings.
- [ ] Separate frontend and backend projects
- [ ] Start using docker for the app
- [ ] Automate deployment for the app
- [ ] Add unit and system test to the app
