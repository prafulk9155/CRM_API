const express = require('express');
const logger = require('morgan');
const customerRoutes = require('./src/routes/customerRoutes');
const leadRoutes= require('./src/routes/leadRoutes')
const dealRoutes= require('./src/routes/dealRoutes')
const contactRoutes = require('./src/routes/contactRoutes')



const app = express();
app.use(express.json());
app.use(logger('dev'));

app.use('/customer', customerRoutes);
app.use('/lead', leadRoutes)
app.use('/deal', dealRoutes)
app.use('/contact', contactRoutes)


app.get('/', (req, res) => {
  res.send('Welcome to the CRM API');
});


const PORT = process.env.PORT || 3333;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});