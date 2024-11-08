var createError = require('http-errors');
var express = require('express');
var http = require('http');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/home');
var usersRouter = require('./routes/cars');

var app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
    res.locals.navbar = `
      <nav>
          <ul>
              <li><a href="/">Strona główna</a></li>
              <li><a href="/porsche">Porsche</a></li>
              <li><a href="/lamborghini">Lamborghini</a></li>
              <li><a href="/ford">Ford</a></li>
              <li><a href="/toyota">Toyota</a></li>
              <li><a href="/cars">Samochody</a></li>
              <li><a href="/cars/add">Dodaj samochod</a></li>
          </ul>
      </nav>
      <style>
          body{
            font-family: Arial, sans-serif;
            margin:0;
            padding:0;
            min-height: 100vh;
            background-color: #f4f4f4;
          }
          nav {
              position: sticky;
              top:0;
              background-color: #fff;
              padding: 10px;
          }
          nav ul {
              list-style: none;
              padding: 0;
          }
          nav li {
              display: inline;
              margin-right: 15px;
          }
          nav a {
              color: #333;
              text-decoration: none;
          }
          nav a:hover {
              text-decoration: underline;
          }
      </style>
  `;
    next();
});

app.use('/', indexRouter);
app.use('/cars', usersRouter);

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

const port = process.env.PORT || 3000;
app.set('port', port);
const server = http.createServer(app);
server.listen(port, () => {
    console.log(`Serwer działa na http://localhost:${port}`);
});

module.exports = app;