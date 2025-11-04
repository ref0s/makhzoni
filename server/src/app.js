const express = require('express');
const cors = require('cors');
const authRouter = require('./routes/auth');
const itemsRouter = require('./routes/items');
const categoriesRouter = require('./routes/categories');
const logger = require('./middleware/logger');
const notFound = require('./middleware/not-found');
const errorHandler = require('./middleware/error-handler');

const app = express();

app.use(cors());
app.use(express.json());
app.use(logger);

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/auth', authRouter);
app.use('/items', itemsRouter);
app.use('/categories', categoriesRouter);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
