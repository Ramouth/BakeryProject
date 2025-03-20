import { useState, useEffect } from "react";
import ContactList from "./ContactList";
import ContactForm from "./ContactForm";

const ContactSection = ({ updateCallback }) => {
  const [contacts, setContacts] = useState([]);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [currentContact, setCurrentContact] = useState({});

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    const response = await fetch("http://127.0.0.1:5000/contacts");
    const data = await response.json();
    setContacts(data.contacts);
  };

  const closeContactModal = () => {
    setIsContactModalOpen(false);
    setCurrentContact({});
  };

  const openCreateContactModal = () => {
    setIsContactModalOpen(true);
  };

  const openEditContactModal = (contact) => {
    setCurrentContact(contact);
    setIsContactModalOpen(true);
  };

  const onContactUpdate = () => {
    closeContactModal();
    fetchContacts();
  };

  return (
    <div>
      <ContactList contacts={contacts} updateContact={openEditContactModal} updateCallback={onContactUpdate} />
      <button onClick={openCreateContactModal}>Create New Contact</button>

      {/* Contact Modal */}
      {isContactModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <span className="close" onClick={closeContactModal}>
              &times;
            </span>
            <ContactForm existingContact={currentContact} updateCallback={onContactUpdate} />
          </div>
        </div>
      )}
    </div>
  );
};

export default ContactSection;
