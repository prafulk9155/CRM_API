
const pool = require('../config/database'); 


class DealController {

  static async dealList(req, res) {
    try {
      const { start = 0, limit = 10, searchText = '', stage = [] } = req.body;
      const offset = Number(start);
  
      // Prepare SQL query filters
      const searchParams = [`%${searchText}%`, `%${searchText}%`, `%${searchText}%`, `%${searchText}%`];
      
      // Base SQL query
      let baseQuery = `
        SELECT deals.*, customer.*, user.*
        FROM deals
        LEFT JOIN customers AS customer ON customer.id = deals.customer_id
        LEFT JOIN users AS user ON user.id = deals.updated_by
        WHERE (customer.first_name LIKE ? 
          OR customer.email LIKE ? 
          OR user.name LIKE ? 
          OR user.email LIKE ?)
      `;
  
      // Append stage filter if stage array is not empty
      if (stage.length > 0) {
        const placeholders = stage.map(() => '?').join(', ');
        baseQuery += ` AND deals.stage IN (${placeholders})`; // Note: ensure 'stage' is prefixed with the table name
        searchParams.push(...stage);
      }
  
      // Append LIMIT and OFFSET
      baseQuery += ` LIMIT ? OFFSET ?`;
      searchParams.push(limit, offset);
  
      // Query to select deals
      const [deals] = await pool.query(baseQuery, searchParams);
      
      // Query to get the total number of deals matching the search criteria
      let totalQuery = `
        SELECT COUNT(*) AS total 
        FROM deals
        LEFT JOIN customers AS customer ON customer.id = deals.customer_id
        LEFT JOIN users AS user ON user.id = deals.updated_by
        WHERE (customer.first_name LIKE ? 
          OR customer.email LIKE ? 
          OR user.name LIKE ? 
          OR user.email LIKE ?)
      `;
  
      // If stage is provided, append it to total query as well
      if (stage.length > 0) {
        const placeholders = stage.map(() => '?').join(', ');
        totalQuery += ` AND deals.stage IN (${placeholders})`; // Prefix 'stage' with table name as well
      }
  
      const [[{ total }]] = await pool.query(totalQuery, [...searchParams.slice(0, 4), ...stage]);
  
      res.json({ 
        success: true, 
        data: deals, 
        pagination: { 
          start: offset, 
          limit, 
          total, 
          totalPages: Math.ceil(total / limit) 
        } 
      });
    } catch (error) {
      console.error('Error in deal list:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Error retrieving deals', 
        error: error.message 
      });
    }
  }

  static async update(req, res) {
    try {
      const { amount, stage, updated_by, assignedTo, id } = req.body; // Ensure 'id' is included in destructured properties
  
      // Validate that the ID is provided
      if (!id) {
        return res.status(400).json({ success: false, message: 'Deal ID is required' });
      }

      if (!updated_by) {
        return res.status(400).json({ success: false, message: 'User ID is required' });
      }
      const [existingDeal] = await pool.query('SELECT * FROM deals WHERE id = ?', [id]);
      if (!existingDeal.length) {
        return res.status(404).json({ success: false, message: 'Deal details not found' });
      }
  
      const currentStatus = existingDeal[0].status;
  
      if (currentStatus === stage) {
        return res.status(400).json({ success: false, message: 'Cannot update deal to the same stage as it is already.' });
      }

      await pool.query('UPDATE deals SET amount = ?, stage = ?, updated_by = ?, updatedAt = NOW(), assignedTo = ? WHERE id = ?', [amount, stage, updated_by, assignedTo, id]);
  
      res.json({ success: true, message: 'Deal updated successfully' });
    } catch (error) {
      console.error('Error in update deal:', error);
      res.status(500).json({ success: false, message: 'Error updating deal', error: error.message });
    }
  }

}

module.exports = DealController;