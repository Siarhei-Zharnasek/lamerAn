var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var router = express.Router();
var mongoose = require('mongoose');
var User = require('./app/models/user');
var Article = require('./app/models/article');

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

router.get('/', (req, res) => res.sendFile('./public/views/index.html'));

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
    var user = new User();

    Object.assign(user, req.body, { name: req.params.username });

    user.save(err => {
      if (err) {
        return res.send(err);
      }
      res.json({ message: 'User created!' });
    });
  })
  .put((req, res) => {
    User.findOneAndUpdate({ username: req.params.username }, { username: req.body.username }, err => {
      if (err) {
        return res.send(err);
      }
      res.json({ message: 'User updated!' });
    });
  })
  .delete((req) => {
    User.findOneAndRemove({ username: req.params.username }, err => {
      if (err) {
        return res.send(err);
      }
      res.json({ message: 'Article updated!' });
    });
  });

router.route('/articles')
  .post((req, res) => {
    var article = new Article();

    Object.assign(article, req.body);

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

app.listen(3000, () => console.log('App listening on port 3000'));
