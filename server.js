require('dotenv').config();
const express = require('express');
const session = require('cookie-session');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const mongoose = require('mongoose');
const app = express();
const expressLayouts = require('express-ejs-layouts');

app.set('view engine', 'ejs');
app.use(expressLayouts);
app.set('layout', 'layout');

const SECRETKEY = process.env.SESSION_SECRET || 'I want to pass COMPS381F';

const users = [
  { name: 'admin', password: '123456' },
  { name: 'guest', password: 'guest' }
];

app.use(
  session({
    name: 'loginSession',
    keys: [SECRETKEY],
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  })
);

app.use((req, res, next) => {
  if (req.session && req.session.username) {
    res.locals.currentUser = { username: req.session.username };
  } else {
    res.locals.currentUser = null;
  }
  res.locals.title = 'Restaurant Manager';
  next();
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static('public'));

const MONGODB_URI = process.env.MONGODB_URI;
console.log('MONGODB_URI from env =', MONGODB_URI);

mongoose
  .connect(MONGODB_URI, {
    serverSelectionTimeoutMS: 5000
  })
  .then(() => {
    console.log('MongoDB connected');
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
  });

const Restaurant = require('./models/restaurant');

function isAuthenticated(req, res, next) {
  if (!req.session.authenticated) {
    // user not logged in
    res.redirect('/login');
  } else {
    next();
  }
}

app.get('/', (req, res) => {
  console.log('Session:', req.session);
  if (!req.session.authenticated) {
    return res.redirect('/login');
  }
  return res.redirect('/restaurants');
});

app.get('/login', (req, res) => {

  if (req.session.authenticated) {
    return res.redirect('/restaurants');
  }
  res.status(200).render('login', { error: null });
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  console.log('Login attempt:', username, password);
  let authenticated = false;

  users.forEach((user) => {
    if (user.name === username && user.password === password) {
      req.session.authenticated = true;
      req.session.username = user.name;
      authenticated = true;
      console.log('Login successful, session:', req.session);
    }
  });

  if (!authenticated) {
    console.log('Login failed');
    return res
      .status(401)
      .render('login', { error: 'Invalid username or password' });
  }

  console.log('Redirecting to /restaurants');
  return res.redirect('/restaurants');
});


app.get('/logout', (req, res) => {
  req.session = null; 
  res.redirect('/');
});

app.get('/restaurants', isAuthenticated, async (req, res) => {
  console.log('Restaurants page - session:', req.session);
  const { name, district, cuisine, minRating } = req.query;

  const filter = {};
  if (name) {
    filter.name = { $regex: name, $options: 'i' };
  }
  if (district) {
    filter.district = district;
  }
  if (cuisine) {
    filter.cuisine = cuisine;
  }
  if (minRating) {
    filter.rating = { $gte: Number(minRating) };
  }

  try {
    const restaurants = await Restaurant.find(filter).sort({ createdAt: -1 });
    res.status(200).render('restaurants_list', {
      restaurants,
      query: { name, district, cuisine, minRating }
    });
  } catch (err) {
    console.error(err);
    res.status(500).render('error', { message: 'Failed to load restaurants' });
  }
});

app.get('/restaurants/new', isAuthenticated, (req, res) => {
  res.status(200).render('restaurants_form', {
    title: 'Add New Restaurant',
    restaurant: {},
    action: '/restaurants',
    method: 'POST'
  });
});

app.post('/restaurants', isAuthenticated, async (req, res) => {
  const { name, district, cuisine, rating } = req.body;

  try {
    await Restaurant.create({
      name,
      district,
      cuisine,
      rating: rating ? Number(rating) : undefined
    });
    res.redirect('/restaurants');
  } catch (err) {
    console.error(err);
    res.status(500).render('error', { message: 'Failed to create restaurant' });
  }
});

app.get('/restaurants/:id/edit', isAuthenticated, async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) {
      return res
        .status(404)
        .render('error', { message: 'Restaurant not found' });
    }

    res.status(200).render('restaurants_form', {
      title: 'Edit Restaurant',
      restaurant,
      action: `/restaurants/${restaurant._id}?_method=PUT`,
      method: 'POST'
    });
  } catch (err) {
    console.error(err);
    res.status(500).render('error', { message: 'Failed to load restaurant' });
  }
});

app.put('/restaurants/:id', isAuthenticated, async (req, res) => {
  const { name, district, cuisine, rating } = req.body;

  try {
    await Restaurant.findByIdAndUpdate(req.params.id, {
      name,
      district,
      cuisine,
      rating: rating ? Number(rating) : undefined
    });
    res.redirect('/restaurants');
  } catch (err) {
    console.error(err);
    res.status(500).render('error', { message: 'Failed to update restaurant' });
  }
});

app.delete('/restaurants/:id', isAuthenticated, async (req, res) => {
  try {
    await Restaurant.findByIdAndDelete(req.params.id);
    res.redirect('/restaurants');
  } catch (err) {
    console.error(err);
    res.status(500).render('error', { message: 'Failed to delete restaurant' });
  }
});

app.get('/api/restaurants', async (req, res) => {
  const { name, district, cuisine, minRating } = req.query;
  const filter = {};

  if (name) {
    filter.name = { $regex: name, $options: 'i' };
  }
  if (district) {
    filter.district = district;
  }
  if (cuisine) {
    filter.cuisine = cuisine;
  }
  if (minRating) {
    filter.rating = { $gte: Number(minRating) };
  }

  try {
    const restaurants = await Restaurant.find(filter).sort({ createdAt: -1 });
    res.status(200).json(restaurants);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch restaurants' });
  }
});

app.get('/api/restaurants/:id', async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }
    res.status(200).json(restaurant);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch restaurant' });
  }
});

app.post('/api/restaurants', async (req, res) => {
  const { name, district, cuisine, rating } = req.body;

  try {
    const restaurant = await Restaurant.create({
      name,
      district,
      cuisine,
      rating: rating ? Number(rating) : undefined
    });
    res.status(201).json(restaurant);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create restaurant' });
  }
});

app.put('/api/restaurants/:id', async (req, res) => {
  const { name, district, cuisine, rating } = req.body;

  try {
    const restaurant = await Restaurant.findByIdAndUpdate(
      req.params.id,
      {
        name,
        district,
        cuisine,
        rating: rating ? Number(rating) : undefined
      },
      { new: true }
    );

    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }

    res.status(200).json(restaurant);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update restaurant' });
  }
});

app.delete('/api/restaurants/:id', async (req, res) => {
  try {
    const restaurant = await Restaurant.findByIdAndDelete(req.params.id);
    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }
    res.status(200).json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete restaurant' });
  }
});

app.use((req, res) => {
  res.status(404).render('error', { message: 'Page not found' });
});

app.listen(process.env.PORT || 3000, () => {
  console.log('Server listening on port ' + (process.env.PORT || 3000));
});

