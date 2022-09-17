const mongoose = require('mongoose');
const Tour = require('./tourModel');

const bookingSchema = new mongoose.Schema({
  tour: {
    type: mongoose.Schema.ObjectId,
    ref: 'Tour',
    required: [true, 'Booking must belong to a Tour!']
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Booking must belong to a User!']
  },
  price: {
    type: Number,
    require: [true, 'Booking must have a price.']
  },
  tourStartDate: {
    type: Date,
    require: [true, 'Booking must have a tour start date.']
  },
  createdAt: {
    type: Date,
    default: Date.now()
  },
  paid: {
    type: Boolean,
    default: false
  }
});


bookingSchema.statics.updateBookingReference = async function(tourId, userId, tourStartDate) {
  // Needs to make new search in Booking Model since request object is not shared with mongoose post save middleware
  const checkedObj = await Tour.aggregate([
    {
      $match: { _id: mongoose.Types.ObjectId(tourId) }
    },
    {
      $project: {
        _id: 0,
        startDates: 1,
        maxGroupSize: 1
      }
    },
    {
      $unwind: '$startDates'
    },
    {
      $match: { 'startDates.startDate': new Date(tourStartDate) } 
    },
    {
      $project: {
        _id: 0,
        startDate: "$startDates.startDate",
        maxGroupSize: 1,
        numberOfParticipants: { $cond: { if: { $isArray: "$startDates.participants" }, then: { $size: "$startDates.participants" }, else: 0} }
      }
   }
  ])

  const conditions = { _id: mongoose.Types.ObjectId(tourId), 'startDates.startDate': new Date(tourStartDate)};
  // const conditions = { _id: mongoose.Types.ObjectId(tourId), startDates: { $elemMatch: { startDate: new Date(tourStartDate) } } };

  let isSoldOut = false;
  let update ={};

  if (checkedObj[0].numberOfParticipants >= checkedObj[0].maxGroupSize) {
    isSoldOut = true;
    update = { soldOut: `${isSoldOut}` }
  } else {
    update = { 
      $push: {"startDates.$[startDates].participants": userId},
      soldOut: `${isSoldOut}`
      // $push: { 'startDates.$.participants': userId },
    }
  }

  let options = { arrayFilters: [{"startDates.startDate": new Date(tourStartDate)}] }

  Tour.findOneAndUpdate(conditions, update, options, (err) => {
      if (err) {
        console.log('Error:', err)
      } else {
        console.log(`Added ${userId} in StartDates.participants`)
      }
    }
  );
}

bookingSchema.post('save', function(doc, next) {
  // this points to current booking
  // Needs to use 'constructor' to access static methods
  this.constructor.updateBookingReference(this.tour, this.user, this.tourStartDate);
  next();
});

bookingSchema.pre('aggregate', function(next) {
  next();
});

// // findByIdAndUpdate
// // findByIdAndDelete
// bookingSchema.pre(/^findOneAnd/, async function(next) {
//   //this.r is the 'booking' object made available by the conditions been executed here before any change
//   this.r = await this.findOne();
//   // console.log(this.r);
//   next();
// });

// bookingSchema.post(/^findOneAnd/, async function() {
//   // await this.findOne(); does NOT work here, conditions has been already executed
//   // This trick passes data from PRE to POST middleware
//   await this.r.constructor.calcTourParticipants(this.r.tour);
// });

bookingSchema.pre(/^find/, function(next) {
  this.populate('user').populate({
    path: 'tour',
    select: 'name startDates'
  });
  next();
});

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;
