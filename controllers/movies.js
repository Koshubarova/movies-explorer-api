const Movie = require('../models/movie');
const BadRequestError = require('../errors/BadRequestError');
const NotFoundError = require('../errors/NotFoundError');
const ForbiddenError = require('../errors/ForbiddenError');

module.exports.getMovies = (req, res, next) => {
  Movie.find({ owner: req.user._id })
    // .populate(['owner', 'likes'])
    .then((movies) => res.send(movies))
    .catch(next);
};

module.exports.addMovie = (req, res, next) => {
  const {
    country,
    director,
    duration,
    year,
    description,
    image,
    trailerLink,
    nameRU,
    nameEN,
    thumbnail,
    movieId,
  } = req.body;
  Movie.create({
    country,
    director,
    duration,
    year,
    description,
    image,
    trailerLink,
    nameRU,
    nameEN,
    thumbnail,
    movieId,
    owner: req.user._id,
  })
    .then((movie) => {
      Movie.findById(movie._id)
        .orFail()
        .populate('owner')
        .then((data) => res.status(201).send(data))
        .catch((err) => {
          if (err.name === 'DocumentNotFoundError') {
            next(new NotFoundError('Фильм не найден'));
          } else {
            next(err);
          }
        });
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new BadRequestError('Ошибка валидации'));
      } else {
        next(err);
      }
    });
};

module.exports.deleteMovie = (req, res, next) => {
  Movie.findById(req.params.movieId)
    .then((movie) => {
      if (!movie.owner.equals(req.user._id)) {
        throw new ForbiddenError('Фильм другого пользователя');
      }
      Movie.deleteOne(movie)
        .orFail()
        .then(() => {
          res.send({ message: 'Фильм успешно удален' });
        })
        .catch((err) => {
          if (err.name === 'CastError') {
            next(new BadRequestError('Некорректный запрос'));
          } else if (err.name === 'DocumentNotFoundError') {
            next(new NotFoundError('Фильм не найден'));
          } else {
            next(err);
          }
        });
    })
    .catch((err) => {
      if (err.name === 'TypeError') {
        next(new NotFoundError('Фильм не найден'));
      } else {
        next(err);
      }
    });
};
