const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Tour = require('./../models/tourModel');
const User = require('./../models/userModel');
const Booking = require('./../models/bookingModel');
const catchAsync = require('./../utils/catchAsync');
const factory = require('./handlerFactory');
const mongoose = require('mongoose');
const AppError = require('./../utils/appError');


exports.setTourUserIds = (req, res, next) => {
  // Allow nested routes
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id ? req.user.id : req.params.userId;
  next();
};

exports.checkBookingRules = catchAsync(async (req, res, next) => {
  if (!req.body.tour){
    return next(
      new AppError('You must provide tourId.', 409)
    );
  }
  if (!req.body.tourStartDate){
    return next(
      new AppError('You must provide tourStartDate.', 409)
    );
  }
  const tourId = req.body.tour;
  const tourStartDate = req.body.tourStartDate;


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
  ]); 
  console.log('bookingController checkedObj: ', checkedObj);

  if (checkedObj.length <= 0) {
    return next(
      new AppError(`Not found a Tour: ${tourId} with provided Start Date: ${tourStartDate}.`, 409)
    );
  }

  if (checkedObj[0].numberOfParticipants >= checkedObj[0].maxGroupSize) {
    return next(
      new AppError('The tour has no vacancies for this date. The group is at full capacity.', 409)
    );
  }
  next();
});

exports.getStripeCheckoutSession = catchAsync(async (req, res, next) => {
  // 1) Get the currently booked tour and tour start date
  //    clientReferenceId = {tourId}_{startDate_in_milissecods}, this is used because strips allows only one key reference
  //    and tourId + startDate is required to identify user tour
  const tourId = req.params.tourId;
  const clientReferenceId = req.query.clientReferenceId;
  console.log('getStripeCheckoutSession tourId: ', tourId);
  console.log('getStripeCheckoutSession clientReferenceId: ', clientReferenceId);

  const tour = await Tour.findById(tourId);

  // 2) Create checkout session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    // success_url: `${req.protocol}://${req.get('host')}/my-tours/?tour=${
    //   req.params.tourId
    // }&user=${req.user.id}&price=${tour.price}`,
    success_url: `${req.protocol}://${req.get('host')}/my-tours?alert=booking`,
    cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
    customer_email: req.user.email,
    client_reference_id: clientReferenceId,
    // client_reference_id: tourId,
    line_items: [
      {
        name: `${tour.name} Tour`,
        description: tour.summary,
        images: [
          `${req.protocol}://${req.get('host')}/img/tours/${tour.imageCover}`
        ],
        amount: tour.price * 100,
        currency: 'usd',
        quantity: 1
      }
    ]
  });

  // 3) Create session as response
  res.status(200).json({
    status: 'success',
    session
  });
});

// Payment control is set one time after checkout confirmation sent bt stripe webhook
// It works only in ptoduction environment once is configures in stripe to do so
const createBookingAfterCheckout = async session => {
  const clientReferenceId = session.client_reference_id;
  const userId = (await User.findOne({ email: session.customer_email })).id;
  const price = session.display_items[0].amount / 100;

  let tourId, tourStartDate;
  if (clientReferenceId) {
    const arrClientReference = clientReferenceId.split("_");
    console.log('createBookingAfterCheckout clientReferenceId arrClientReference: ', arrClientReference);

    tourId = arrClientReference[0];
    // Convert from milisseconds format to date format
    tourStartDate = new Date(arrClientReference[1]);

    console.log('createBookingAfterCheckout clientReferenceId tourId: ', tourId);
    console.log('createBookingAfterCheckout clientReferenceId tourStartDate: ', tourStartDate);
  }

  const bookingObj = {
    _id: clientReferenceId,
    tour: tourId,
    user: userId,
    price,
    tourStartDate
  }
  
  await Booking.create(bookingObj);
};

exports.webhookStripeCheckout = (req, res, next) => {
   let signature;
  if (req.headers['stripe-signature']) {
    // Get stripe-signature from header
    signature = req.headers['stripe-signature'];
  } else {
    // Manually create stripe-signature for testing
    signature = stripe.webhooks.generateTestHeaderString({
      payload: JSON.stringify(req.body, null, 2),
      secret: process.env.STRIPE_WEBHOOK_SECRET
    });
  }
  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    // Stripe will receive this response
    return res.status(400).send(`Webhook error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    createBookingAfterCheckout(event.data.object);
  }

  res.status(200).json({ received: true });
};

exports.createBooking = factory.createOne(Booking);
exports.getBooking = factory.getOneById(Booking);
exports.getAllBookings = factory.getAll(Booking);
exports.updateBooking = factory.updateOne(Booking);
exports.deleteBooking = factory.deleteOne(Booking);
