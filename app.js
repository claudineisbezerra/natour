const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
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

// Start express app
const app = express();

app.enable('trust proxy');

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// 1) GLOBAL MIDDLEWARES
// Implement CORS
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


// app.use(helmet());

// Set security HTTP headers - Advanced configuration to avoid problems with mapbox and login at development
const defaultSrc = [
  'https:',
  'https://*.stripe.com/',
  'https://*.mapbox.com/'
];
const scriptSrc = [
  'https://js.stripe.com/',
  'https://checkout.stripe.com/',
  'https://js.stripe.com/',
  'https://edge-js.stripe.com',
  'https://api.mapbox.com/'
];
const scriptSrcElem = [
  'https://api.mapbox.com/',
  'https://js.stripe.com/',
  'https://edge-js.stripe.com',
  'https://checkout.stripe.com/',
  'https://js.stripe.com/'
];

const styleSrc = [
  'https://api.mapbox.com/',
  'https://fonts.googleapis.com/'
];
const connectSrc = [
  'https://js.stripe.com/',
  'https://checkout.stripe.com/',
  'https://api.stripe.com/',
  'https://*.mapbox.com/',
  'http://127.0.0.1:*/',
  'ws://127.0.0.1:*/',
  'ws://tranquil-dawn-87413.herokuapp.com:*/',
  'wss://tranquil-dawn-87413.herokuapp.com:*/'
];
const imgSrc = [
  'https://*.stripe.com'
];
const fontSrc = [
  'fonts.googleapis.com', 
  'fonts.gstatic.com'
];
const frameSrc = [
  'https://js.stripe.com',
  'https://hooks.stripe.com'
];
app.use(
  helmet  
  .contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'", ...defaultSrc],
      baseUri: ["'self'"],
      connectSrc: ["'self'", ...connectSrc],
      scriptSrc: ["'self'",  "'unsafe-inline'", ...scriptSrc],
      scriptSrcElem: ["'self'", "'unsafe-inline'", ...scriptSrcElem],
      styleSrc: ["'self'", 'https:', "'unsafe-inline'", ...styleSrc],
      workerSrc: ["'self'", 'blob:'],
      objectSrc: ["'none'"],
      imgSrc: ["'self'", 'blob:', 'data:', ...imgSrc],
      frameSrc: ["'self'",...frameSrc],
      fontSrc: ["'self'", 'https:', 'data:', ...fontSrc]
    },
  })
);


// const defaultSrc = [
//   'https://*.mapbox.com/',
//   'https://*.stripe.com'
// ];
// const scriptSrc = [
//   'http://*',
//   'https://api.mapbox.com/',
//   'https://checkout.stripe.com',
//   'https://api.stripe.com',
//   'https://js.stripe.com',
//   'https://edge-js.stripe.com'
// ];
// const scriptSrcElem = [
//   'http://*',
//   'https://api.mapbox.com/',
//   'https://checkout.stripe.com',
//   'https://api.stripe.com',
//   'https://js.stripe.com',
//   'https://edge-js.stripe.com'
// ]
// const styleSrc = [
//   'http://*',
//   'https://api.mapbox.com/',
//   'https://fonts.googleapis.com/'
// ];
// const connectSrc = [
//   'https://checkout.stripe.com',
//   'https://api.stripe.com',
//   'https://js.stripe.com',
//   'https://edge-js.stripe.com',
//   'https://*.mapbox.com/',
//   'http://127.0.0.1:*/',
//   'ws://127.0.0.1:*',
//   'http://localhost:*/',
//   'ws://localhost:*'  
// ];
// const imgSrc = [
//   'https://*.stripe.com'
// ];
// const frameSrc = [
//   'https://checkout.stripe.com',
//   'https://js.stripe.com',
//   'https://hooks.stripe.com'
// ];
// const fontSrc = [
//   'fonts.googleapis.com', 
//   'fonts.gstatic.com'
// ];

// app.use(
//   helmet  
//   .contentSecurityPolicy({
//     directives: {
//       defaultSrc: ["'self'", 'data:', 'gap:', ...defaultSrc],
//       baseUri: ["'self'"],
//       connectSrc: ["'self'", ...connectSrc],
//       scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", ...scriptSrc],
//       scriptSrcElem: ["'self'", "'unsafe-inline'", "'unsafe-eval'", ...scriptSrcElem],
//       styleSrc: ["'self'", 'http://*', "'unsafe-inline'", ...styleSrc],
//       workerSrc: ["'self'", 'blob:'],
//       objectSrc: ["'none'"],
//       imgSrc: ["'self'", 'blob:', 'data:', ...imgSrc],
//       fontSrc: ["'self'", ...fontSrc],
//       frameSrc: ["'self'",...frameSrc]
//     },
//   })
// );


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

// Stripe webhook, BEFORE body-parser (express.json), because stripe needs the body as stream and not as JSON
// to-do: Substitute bodyParser.raw() by new express.raw() recently available in express
app.post('/webhook-checkout',bodyParser.raw({ type: 'application/json' }), bookingController.webhookCheckout);

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
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
