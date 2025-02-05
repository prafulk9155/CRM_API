
const pool = require('../config/database'); 


class LeadController {
  static async create(req, res) {
    try {
      const { customer_id, assignedTo, status,notes } = req.body;
      if (!customer_id || !assignedTo || !status ) {
        return res.status(400).json({ success: false, message: 'Customer Id, Assigned Id and Status are required fields' });
      }

      const [existingCustomer] = await pool.query('SELECT id FROM leads WHERE customer_id = ?', [customer_id]);
      if (existingCustomer.length) {
        return res.status(400).json({ success: false, message: 'Customer already exists' });
      }

      const [customerExist] = await pool.query('SELECT id FROM customers WHERE id = ?', [customer_id]);
      if (!customerExist.length) {
        return res.status(400).json({ success: false, message: 'Customer does not exist exists' });
      }

      const [userExist] = await pool.query('SELECT id FROM users WHERE id = ?', [assignedTo]);
      if (!customerExist.length) {
        return res.status(400).json({ success: false, message: 'Customer does not exist exists' });
      }

      const [result] = await pool.query('INSERT INTO leads (customer_id, assignedTo, status, notes) VALUES (?, ?, ?, ?)', [customer_id, assignedTo, status, notes]);
      res.status(201).json({ success: true, message: "Leads added successfully" });
    } catch (error) {
      console.error('Error in adding lead:', error);
      res.status(500).json({ success: false, message: 'Error adding customer to lead', error: error.message });
    }
  }

  static async leadList(req, res) {
    try {
      const { start = 0, limit = 10, searchText = '' } = req.body;
      const offset = Number(start); 
  
      const [leads] = await pool.query(`
        SELECT leads.id as id, leads.status, leads.notes as lead_notes, customer.first_name, customer.last_name, customer.email,customer.phone1, customer.phone2, 
        CONCAT(customer.city, ', ', customer.state, ', ', customer.country) AS address, user.name as assigned_to, user.email as assigned_email,user.role as assigned_user_role
        FROM leads
        LEFT JOIN customers AS customer ON customer.id = leads.customer_id
        LEFT JOIN users AS user ON user.id = leads.assignedTo
        WHERE customer.first_name LIKE ? 
           OR customer.email LIKE ? 
           OR user.name LIKE ? 
           OR user.email LIKE ?
        LIMIT ? OFFSET ?
      `, 
      [`%${searchText}%`, `%${searchText}%`, `%${searchText}%`, `%${searchText}%`, limit, offset]);
      
      // Query to get the total number of leads matching the search criteria
      const [[{ total }]] = await pool.query(`
        SELECT COUNT(*) AS total 
        FROM leads
        LEFT JOIN customers AS customer ON customer.id = leads.customer_id
        LEFT JOIN users AS user ON user.id = leads.assignedTo
        WHERE customer.first_name LIKE ? 
           OR customer.email LIKE ? 
           OR user.name LIKE ? 
           OR user.email LIKE ?
      `, 
      [`%${searchText}%`, `%${searchText}%`, `%${searchText}%`, `%${searchText}%`]);
  
      res.json({ 
        success: true, 
        data: leads, 
        pagination: { 
          start: offset, 
          limit, 
          total, 
          totalPages: Math.ceil(total / limit) 
        } 
      });
    } catch (error) {
      console.error('Error in lead list:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Error retrieving leads', 
        error: error.message 
      });
    }
  }

  static async findById(req, res) {
    try {
      // Expecting the id to come from the request parameters
      const { id } = req.body; 
      console.log(id);
  
      const [lead] = await pool.query(`
        SELECT leads.id as id, leads.status, leads.notes as lead_notes, customer.first_name, customer.last_name, customer.email,customer.phone1, customer.phone2, 
        CONCAT(customer.city, ', ', customer.state, ', ', customer.country) AS address, user.name as assigned_to, user.email as assigned_email,user.role as assigned_user_role
        FROM leads
        LEFT JOIN customers AS customer ON customer.id = leads.customer_id
        LEFT JOIN users AS user ON user.id = leads.assignedTo 
        WHERE leads.id = ?
      `, [id]);
      
      // Check if any lead was returned
      if (!lead.length) {
        return res.status(404).json({ success: false, message: 'Lead details not found' });
      }
      // Return the first lead found
      res.json({ success: true, data: lead[0] });
    } catch (error) {
      console.error('Error in find lead by id:', error);
      res.status(500).json({ success: false, message: 'Error retrieving lead', error: error.message });
    }
  }

  static async update(req, res) {
    try {
      const { id, assignedTo, status, notes } = req.body;
      if (!id) {
        return res.status(400).json({ success: false, message: 'Lead ID is required' });
      }
   
  
      const [existingLead] = await pool.query('SELECT * FROM leads WHERE id = ?', [id]);
      if (!existingLead.length) {
        return res.status(404).json({ success: false, message: 'Lead details not found' });
      }

    const currentStatus = existingLead[0].status;
    // console.log(currentStatus,existingLead[0].status)

    if (currentStatus === status) {
      return res.status(400).json({ success: false, message: 'Cannot update lead to the same status as it is already.' });
    }
  
      await pool.query('UPDATE leads SET assignedTo = ?, status = ?, notes = ? WHERE id = ?', [assignedTo, status, notes, id]);
      if (status === 'qualified' ) {
        const groupName= req.body.group_name||'marketing'
        const customerId = existingLead[0].customer_id; 
        let updated_by = await pool.query('SELECT assignedTo FROM leads WHERE id = ?', [id]);
      let updated_by_id = updated_by[0]?.[0]?.assignedTo || null;
      const assignedTo = req.body.assignedTo || updated_by_id;

        await pool.query('INSERT INTO contacts (customer_id, updated_by, `group_name`) VALUES (?, ?, ?)', [customerId, assignedTo, groupName]);
      }
  
      res.json({ success: true, message: 'Lead updated successfully' });
    } catch (error) {
      console.error('Error in update lead:', error);
      res.status(500).json({ success: false, message: 'Error updating lead', error: error.message });
    }
  }

}

module.exports = LeadController;