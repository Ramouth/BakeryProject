import apiClient from './api';

/**
 * Service for handling contact-related API calls
 */
const contactService = {
  /**
   * Get all contacts
   * @returns {Promise<Array>} - List of contacts
   */
  getAllContacts: async () => {
    const response = await apiClient.get('/contacts');
    return response.contacts;
  },

  /**
   * Create a new contact
   * @param {Object} contactData - Contact data
   * @returns {Promise<Object>} - Created contact
   */
  createContact: async (contactData) => {
    const response = await apiClient.post('/contacts/create', contactData);
    return response;
  },

  /**
   * Update an existing contact
   * @param {string|number} id - Contact ID
   * @param {Object} contactData - Updated contact data
   * @returns {Promise<Object>} - Updated contact
   */
  updateContact: async (id, contactData) => {
    const response = await apiClient.patch(`/contacts/update/${id}`, contactData);
    return response;
  },

  /**
   * Delete a contact
   * @param {string|number} id - Contact ID
   * @returns {Promise<Object>} - Deletion response
   */
  deleteContact: async (id) => {
    const response = await apiClient.delete(`/contacts/delete/${id}`);
    return response;
  },
};

export default contactService;