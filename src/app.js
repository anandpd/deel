const express = require('express');
const bodyParser = require('body-parser');
const { sequelize } = require('./model')

// Routes
const contractRoutes = require('./routes/contracts');
const balanceRoutes = require('./routes/balance');
const adminRoutes = require('./routes/admin');
const clientRoutes = require('./routes/client');
const jobRoutes = require('./routes/jobs');

const app = express();
app.use(bodyParser.json());
app.set('sequelize', sequelize)
app.set('models', sequelize.models)

// Routers
app.use('/contracts', contractRoutes);
app.use('/jobs', jobRoutes);
app.use('/client', clientRoutes);
app.use('/balances', balanceRoutes);
app.use('/admin', adminRoutes);



module.exports = app;
