
const pool = require('../config/database'); 


class ContactController {

    static async contactList(req, res) {
        try {
          const { start = 0, limit = 10, searchText = '', group = [] } = req.body;
          const offset = Number(start);
      
          const searchParams = [`%${searchText}%`, `%${searchText}%`, `%${searchText}%`, `%${searchText}%`];
          
          let baseQuery = `
            SELECT contacts.*, customer.*, user.*
            FROM contacts
            LEFT JOIN customers AS customer ON customer.id = contacts.customer_id
            LEFT JOIN users AS user ON user.id = contacts.updated_by
            WHERE (customer.first_name LIKE ? 
              OR customer.email LIKE ? 
              OR user.name LIKE ? 
              OR user.email LIKE ?)
          `;
      
          if (group.length > 0) {
            const placeholders = group.map(() => '?').join(', ');
            baseQuery += ` AND group_name IN (${placeholders})`;
            searchParams.push(...group);
          }

          baseQuery += ` LIMIT ? OFFSET ?`;
          searchParams.push(limit, offset);
      
          const [contacts] = await pool.query(baseQuery, searchParams);
          
          let totalQuery = `
            SELECT COUNT(*) AS total 
            FROM contacts
            LEFT JOIN customers AS customer ON customer.id = contacts.customer_id
            LEFT JOIN users AS user ON user.id = contacts.updated_by
            WHERE (customer.first_name LIKE ? 
              OR customer.email LIKE ? 
              OR user.name LIKE ? 
              OR user.email LIKE ?)
          `;
      
          if (group.length > 0) {
            const placeholders = group.map(() => '?').join(', ');
            totalQuery += ` AND group_name IN (${placeholders})`;
          }
      
          const [[{ total }]] = await pool.query(totalQuery, [...searchParams.slice(0, 4), ...group]);
      
          res.json({ 
            success: true, 
            data: contacts, 
            pagination: { 
              start: offset, 
              limit, 
              total, 
              totalPages: Math.ceil(total / limit) 
            } 
          });
        } catch (error) {
          console.error('Error in contact list:', error);
          res.status(500).json({ 
            success: false, 
            message: 'Error retrieving contacts', 
            error: error.message 
          });
        }
      }

      static async update(req, res) {
        try {
          const { group, is_active, status, id, updated_by } = req.body;
      
          if (!id) {
            return res.status(400).json({ success: false, message: 'Contact ID is required' });
          }

          if (!updated_by) {
            return res.status(400).json({ success: false, message: 'User ID is required' });
          }

          const [existingContact] = await pool.query('SELECT * FROM contacts WHERE id = ?', [id]);
          if (!existingContact.length) {
            return res.status(404).json({ success: false, message: 'Contact details not found' });
          }
      
          const currentStatus = existingContact[0].status;

          if (currentStatus === status) {
            return res.status(400).json({ success: false, message: 'Cannot update lead to the same status as it is already.' });
          }

          await pool.query('UPDATE contacts SET `group_name` = ?, status = ?, updated_by = ?, updated_at = NOW(), is_active=? WHERE id = ?', [group, status, updated_by,is_active, id]);

          if (status === 'deal') {
            const groupName = req.body.group_name || 'deal'; 
            const customerId = existingContact[0].customer_id; 
            await pool.query('INSERT INTO deals (customer_id, updated_by) VALUES (?, ?)', [customerId, updated_by]); // Removed trailing comma
          }
      
          res.json({ success: true, message: 'Contact updated successfully' });
        } catch (error) {
          console.error('Error in update contact:', error);
          res.status(500).json({ success: false, message: 'Error updating contact', error: error.message });
        }
      }

}

module.exports = ContactController;