const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Tour = require('./../../models/tourModel');
const Review = require('./../../models/reviewModel');
const User = require('./../../models/userModel');
const Booking = require('./../../models/bookingModel');
const Role = require('./../../models/roleModel');

dotenv.config({ path: './config.env' });

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

mongoose.connect(DB, {}).then(() => console.log('DB connection successful!'));

// READ JSON FILE
const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours_v3.json`, 'utf-8'));
const users = JSON.parse(fs.readFileSync(`${__dirname}/users_v3.json`, 'utf-8'));
const reviews = JSON.parse(fs.readFileSync(`${__dirname}/reviews_v1.json`, 'utf-8'));
const bookings = JSON.parse(fs.readFileSync(`${__dirname}/bookings_v1.json`, 'utf-8'));
const roles = JSON.parse(fs.readFileSync(`${__dirname}/roles_v1.json`, 'utf-8'));

// IMPORT DATA INTO DB
const importData = async () => {
  try {
    await Tour.create(tours);
    await Role.create(roles);
    await User.create(users, { validateBeforeSave: false });
    await User.updateMany({}, {$set: {"verified": true, "verifiedAt": Date.now()}, 
                               $unset: {"verifyToken": 1, "verifyExpires": 1, "verifyNotHashedToken": 1} })
                               .then(res => { }).catch(err => console.log(err));
    await Review.create(reviews);
    await Booking.create(bookings, { validateBeforeSave: false });
    console.log('Data successfully loaded!');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

// DELETE ALL DATA FROM DB
const deleteData = async () => {
  try {
    await Tour.deleteMany();
    await User.deleteMany();
    await Review.deleteMany();
    await Booking.deleteMany();
    await Role.deleteMany();
    console.log('Data successfully deleted!');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
}
