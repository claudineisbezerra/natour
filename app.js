const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const cors = require('cors');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const bookingRouter = require('./routes/bookingRoutes');
const bookingController = require('./controllers/bookingController');
const viewRouter = require('./routes/viewRoutes');
// const { getRoles } = require('./middlewares/loadDataOnStartUp');

// Start express app
const app = express();

// Sample how to set global DATA on app Start Up
// (async function() {
//     app.set("ROLES", await getRoles());
// })();

// How to use it in routes
// req.app.get('ROLES')



app.enable('trust proxy');

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// 1) GLOBAL MIDDLEWARES
// Express middleware to enable CORS
app.use(cors());
// Access-Control-Allow-Origin *
// api.natours.com, front-end: natours.com
// app.use(cors({
//   origin: 'https://www.natours.com'
// }))

// 'options' in this case is just an http request (part of REST APIs cicle)
app.options('*', cors());
// app.options('/api/v1/tours/:id', cors());

// Serving static files
app.use(express.static(path.join(__dirname, 'public')));


// Set Content Security Policy in HTTP headers - Advanced configuration to avoid problems with mapbox and login at development
const CSP ={
  defaultSrc: [
    'https:',
    'https://*.stripe.com/',
    'https://*.mapbox.com/'
  ],
  scriptSrc: [
    'https://js.stripe.com/',
    'https://checkout.stripe.com/',
    'https://js.stripe.com/',
    'https://edge-js.stripe.com',
    'https://api.mapbox.com/'
  ],
  scriptSrcElem: [
    'https://api.mapbox.com/',
    'https://js.stripe.com/',
    'https://edge-js.stripe.com',
    'https://checkout.stripe.com/',
    'https://js.stripe.com/'
  ],
  styleSrc: [
    'https://api.mapbox.com/',
    'https://fonts.googleapis.com/'
  ],
  connectSrc: [
    'https://js.stripe.com/',
    'https://checkout.stripe.com/',
    'https://api.stripe.com/',
    'https://edge-js.stripe.com',
    'https://*.mapbox.com/',
    'http://127.0.0.1:*/',
    'ws://127.0.0.1:*/',
    'ws://tranquil-dawn-87413.herokuapp.com:*/',
    'wss://tranquil-dawn-87413.herokuapp.com:*/'
  ],
  imgSrc: [
    'https://*.stripe.com'
  ],
  fontSrc: [
    'fonts.googleapis.com', 
    'fonts.gstatic.com'
  ],
  frameSrc: [
    'https://js.stripe.com',
    'https://hooks.stripe.com'
  ]
}
app.use(
  helmet  
  .contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'", ...CSP.defaultSrc],
      baseUri: ["'self'"],
      connectSrc: ["'self'", ...CSP.connectSrc],
      scriptSrc: ["'self'",  "'unsafe-inline'", ...CSP.scriptSrc],
      scriptSrcElem: ["'self'", "'unsafe-inline'", ...CSP.scriptSrcElem],
      styleSrc: ["'self'", 'https:', "'unsafe-inline'", ...CSP.styleSrc],
      workerSrc: ["'self'", 'blob:'],
      objectSrc: ["'none'"],
      imgSrc: ["'self'", 'blob:', 'data:', ...CSP.imgSrc],
      frameSrc: ["'self'",...CSP.frameSrc],
      fontSrc: ["'self'", 'https:', 'data:', ...CSP.fontSrc]
    },
  })
);

// Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Limit requests from same API
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour!'
});
app.use('/api', limiter);

// Stripe webhook, BEFORE express.raw() parser, because stripe needs the body as stream/buffer and not as JSON
app.post('/webhook-checkout', express.raw({type: 'application/json'}), bookingController.webhookStripeCheckout);

// parse requests of content-type - application/json
app.use(express.json({ limit: '10kb' }));

// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// parse cookies mainly for secutiry reasons implementations
app.use(cookieParser());

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Prevent parameter pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price'
    ]
  })
);

app.use(compression());

// Test middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  // console.log(req.cookies);
  next();
});

// 3) ROUTES
app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
