import createError from "http-errors";
import express from "express";
import path from "path";
import cookieParser from "cookie-parser";
import lessMiddleware from "less-middleware";
import logger from "morgan";
import twig from "twig";
import indexRouter from "./routes/index";

/**
 * Nothing but Express boilerplate here.
 * Sets up the app and injects all the basic Express stuff, such as router, render engine, static file serving, ...
 */

export let app = express();

// view engine setup
app.set('views', path.join(__dirname, '../src/be/views'));
app.set('view engine', 'twig');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(lessMiddleware(path.join(__dirname, '../dist')));
app.use('/', indexRouter());
app.use('/script',express.static(path.join(__dirname, '../perftest/')));
app.use(express.static(path.join(__dirname, '../dist')));

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});
