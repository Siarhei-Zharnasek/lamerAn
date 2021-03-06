var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var User = require('./app/models/user');
var Article = require('./app/models/article');
var passport = require('passport');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var LocalStrategy = require('passport-local').Strategy;
var router = express.Router();
var app = express();

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser('secret'));
app.use('/app', express.static('app'));
app.use('/node_modules', express.static('node_modules'));

app.use(session({ secret: 'secret', resave: true, saveUninitialized: true, cookie: { maxAge : 3600000 } }));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

router.get('/', (req, res) => res.sendFile(__dirname + '/app/index.html'));

router.route('/users/:username')
  .get((req, res) => {
    User.findOne({ username: req.params.username }, (err, user) => {
      if (err) {
        return res.send(err);
      }
      res.json(user);
    });
  })
  .post((req, res) => {
    User.findOne({ username: req.body.username }, (err, user) => {
      if (err) {
        return res.send(err);
      }
      if (!user) {
        User.register(new User({ username: req.body.username }), req.body.password, (err, user) => {
          if (err) {
            res.send(err);
          }
          passport.authenticate('local')(req, res, () => res.json({ user }));
        });
      } else {
        res.send();
      }
    });
  })
  .put((req, res) => {
    User.findOne({ username: req.params.username }, (err, user) => {
      if (err) {
        return res.send(err);
      }

      const newLike = req.body.like;
      const newDislike = req.body.dislike;
      const isDeleteLike = req.query.deleteLike;
      const isDeleteDislike = req.query.deleteDislike;

      if (newLike) {
        if (isDeleteDislike) {
          user.dislikes.splice(user.dislikes.indexOf(newLike), 1);
        } else {
          user.likes.push(newLike);
        }
      } else if (newDislike) {
        if (isDeleteLike) {
          user.likes.splice(user.likes.indexOf(newDislike), 1);
        } else {
          user.dislikes.push(newDislike);
        }
      }

      user.save(err => {
        if (err) {
          return res.send(err);
        }
        res.end();
      });
    });
  })
  .delete((req, res) => {
    User.findOneAndRemove({ username: req.params.username }, err => {
      if (err) {
        return res.send(err);
      }
      res.json({ message: 'User deleted!' });
    });
  });

router.post('/login', passport.authenticate('local'), (req, res) => {
  res.json({ user: req.user });
});

router.get('/logout', (req, res) => {
  req.logout();
  res.end();
});

router.route('/articles')
  .post((req, res) => {
    var article = new Article();

    Object.assign(article, req.body, { 'creation date': new Date(), rating: 0 });

    article.save(err => {
      if (err) {
        return res.send(err);
      }
      res.json({ message: 'Article created!' });
    });
  })
  .get((req, res) => {
    Article.find({}, (err, articles) => {
      if (err) {
        return res.send(err);
      }
      res.json(articles);
    });
  });

router.route('/articles/:id')
  .put((req, res) => {
    Article.findOneAndUpdate({ _id: req.params.id }, req.body, err => {
      if (err) {
        return res.send(err);
      }
      res.json({ message: 'Article updated!' });
    });
  })
  .delete((req, res) => {
    Article.findOneAndRemove({ _id: req.params.id }, err => {
      if (err) {
        return res.send(err);
      }
      res.json({ message: 'Article deleted!' });
    });
  });

router.route('/articles/comment/:_id')
  .put((req, res) => {
    const comment = req.body.comment;
    const username = req.user.username;
    const title = req.body.title;

    User.findOne({ username }, (err, user) => {
      if (err) {
        return res.send(err);
      }
      user.comments.push({ comment, title, article: req.params._id, date: new Date() });
      user.save(err => {
        if (err) {
          return res.send(err);
        }
        res.end();
      });
    });

    Article.findOne(req.params, (err, article) => {
      if (err) {
        return res.send(err);
      }
      article.comments.push({ author: username, comment, date: new Date() });
      article.save(err => {
        if (err) {
          return res.send(err);
        }
        res.end();
      });
    });
  });

router.route('/articles/random')
  .get((req, res) => {
    Article.find({}, (err, articles) => {
      if (err) {
        return res.send(err);
      }
      var length = articles.length,
          randomNumber = (Math.random * length) + 1;
      res.json(articles[randomNumber]);
    });
  });

router.route('/articles/:startIndex/:count?sort')
  .get((req, res) => {
    console.log(req);
    Article.find({}, (err, articles) => {
      if (err) {
        return res.send(err);
      }
      res.json(articles[randomNumber]);
    });
  });


app.use('/', router);

app.listen(666, () => console.log('App listening on port 666'));
