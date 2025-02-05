const express = require('express');
const logger = require('morgan');
const customerRoutes = require('./src/routes/customerRoutes');
const leadRoutes= require('./src/routes/leadRoutes')
const dealRoutes= require('./src/routes/dealRoutes')
const contactRoutes = require('./src/routes/contactRoutes')
// const taskRoutes= require('./src/routes/taskRoutes')
// const companyRoutes= require('./src/routes/companyRoutes')


const app = express();
app.use(express.json());
app.use(logger('dev'));

app.use('/customer', customerRoutes);
app.use('/lead', leadRoutes)
app.use('/deal', dealRoutes)
app.use('/contact', contactRoutes)
// app.use('/task', taskRoutes)
// app.use('/company', companyRoutes)

app.get('/', (req, res) => {
  res.send('Welcome to the API');
});


const PORT = process.env.PORT || 3333;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});