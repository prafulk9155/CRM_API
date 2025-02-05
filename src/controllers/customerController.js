const pool = require('../config/database'); 

class CustomerController {
  // Create customer
  static async create(req, res) {
    try {
      const { name, email, phone } = req.body;
      if (!name || !email) {
        return res.status(400).json({ success: false, message: 'Name and email are required fields' });
      }

      const [existingCustomer] = await pool.query('SELECT id FROM customers WHERE email = ?', [email]);
      if (existingCustomer.length) {
        return res.status(400).json({ success: false, message: 'Customer with this email already exists' });
      }

      const [result] = await pool.query('INSERT INTO customers (name, email, phone, source) VALUES (?, ?, ?, ?)', [name, email, phone, 'direct']);
      res.status(201).json({ success: true, data: { id: result.insertId, name, email, phone } });
    } catch (error) {
      console.error('Error in create customer:', error);
      res.status(500).json({ success: false, message: 'Error creating customer', error: error.message });
    }
  }

  // Get all customers with pagination
  static async findAll(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const offset = (page - 1) * limit;

      const [customers] = await pool.query('SELECT * FROM customers LIMIT ? OFFSET ?', [limit, offset]);
      const [[{ total }]] = await pool.query('SELECT COUNT(*) AS total FROM customers');

      res.json({ success: true, data: customers, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
    } catch (error) {
      console.error('Error in find all customers:', error);
      res.status(500).json({ success: false, message: 'Error retrieving customers', error: error.message });
    }
  }

  // Find customer by ID
  static async findById(req, res) {
    try {
      const { id } = req.query || req.params;
      if (!id) {
        return res.status(400).json({ success: false, message: 'ID is required' });
      }
      const [customer] = await pool.query('SELECT * FROM customers WHERE id = ?', [id]);

      if (!customer.length) {
        return res.status(404).json({ success: false, message: 'Customer not found' });
      }
  
      res.json({ success: true, data: customer[0] });
    } catch (error) {
      console.error('Error in find customer by id:', error);
      res.status(500).json({ success: false, message: 'Error retrieving customer', error: error.message });
    }
  }

  // Update customer
  static async update(req, res) {
    try {
      const {id, first_name,last_name, email, phone } = req.body;

      const [existingCustomer] = await pool.query('SELECT * FROM customers WHERE id = ?', [id]);
      if (!existingCustomer.length) {
        return res.status(404).json({ success: false, message: 'Customer not found' });
      }

      await pool.query('UPDATE customers SET first_name = ?,last_name = ?, email = ?, phone1 = ? WHERE id = ?', [first_name || existingCustomer[0].first_name,last_name || existingCustomer[0].last_name, email || existingCustomer[0].email, phone || existingCustomer[0].phone, id]);
      res.json({ success: true, message: 'Customer updated successfully' });
    } catch (error) {
      console.error('Error in update customer:', error);
      res.status(500).json({ success: false, message: 'Error updating customer', error: error.message });
    }
  }

  static async delete(req, res) {
    try {
      const { id } = req.body;
      if (!id) {
        return res.status(400).json({ success: false, message: 'ID is required' });
      }
      const [result] = await pool.query('DELETE FROM customers WHERE id = ?', [id]);
      if (result.affectedRows === 0) {
        return res.status(404).json({ success: false, message: 'Customer not found' });
      }
      res.json({ success: true, message: 'Customer deleted successfully' });
    } catch (error) {
      console.error('Error in delete customer:', error);
      res.status(500).json({ success: false, message: 'Error deleting customer', error: error.message });
    }
  }

  static async search(req, res) {
    console.log(req.query);
    try {
      const { query } = req.query;
      console.log(query);
      
      if (!query) {
        return res.status(400).json({ success: false, message: 'Search query is required' });
      }

      const [customers] = await pool.query('SELECT * FROM customers WHERE first_name LIKE ? OR last_name LIKE ? OR email LIKE ?', [`%${query}%`,`%${query}%`, `%${query}%`]);

      if (customers.length === 0) {
        return res.status(404).json({ success: false, message: 'No customers found matching the search query' });
      }

      res.json({ success: true, data: customers });
    } catch (error) {
      console.error('Error in search customers:', error);
      res.status(500).json({ success: false, message: 'Error searching customers', error: error.message });
    }
  }

  static async count(req,res){
    try{
      const [count] = await pool.query('SELECT COUNT(*) as count FROM customers');
      res.json({success:true, data:count[0].count});
    }
    catch(error){
      console.error('Error in count customers:', error);
      res.status(500).json({ success: false, message: 'Error counting customers', error: error.message });
    }

  }

  static async getData(req,res){
    try{
      const {id,first_name,last_name}= req.body
      const data = await pool.query("select * from customers where first_name =? ")

    }catch(error){
      console.error('Error in get data:', error);
      res.status(500).json({success:false, message:"Error", err:error.message})
    }
  }
}




module.exports = CustomerController;
