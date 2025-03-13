import { useState, useEffect } from "react";
import BakeryList from "./BakeryList";
import ContactList from "./ContactList";
import BakeryForm from "./BakeryForm";
import ContactForm from "./ContactForm";
import "./App.css";

function App() {
  const [bakeries, setBakeries] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [isBakeryModalOpen, setIsBakeryModalOpen] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [currentBakery, setCurrentBakery] = useState({});
  const [currentContact, setCurrentContact] = useState({});
  const [activeTab, setActiveTab] = useState("contacts"); // State for active tab ("contacts" or "bakeries")

  useEffect(() => {
    fetchBakeries();
    fetchContacts();
  }, []);

  const fetchBakeries = async () => {
    const response = await fetch("http://127.0.0.1:5000/bakeries");
    const data = await response.json();
    setBakeries(data.bakeries);
  };

  const fetchContacts = async () => {
    const response = await fetch("http://127.0.0.1:5000/contacts");
    const data = await response.json();
    setContacts(data.contacts);
  };

  const closeBakeryModal = () => {
    setIsBakeryModalOpen(false);
    setCurrentBakery({});
  };

  const closeContactModal = () => {
    setIsContactModalOpen(false);
    setCurrentContact({});
  };

  const openCreateBakeryModal = () => {
    if (!isBakeryModalOpen) setIsBakeryModalOpen(true);
  };

  const openCreateContactModal = () => {
    if (!isContactModalOpen) setIsContactModalOpen(true);
  };

  const openEditBakeryModal = (bakery) => {
    if (isBakeryModalOpen) return;
    setCurrentBakery(bakery);
    setIsBakeryModalOpen(true);
  };

  const openEditContactModal = (contact) => {
    if (isContactModalOpen) return;
    setCurrentContact(contact);
    setIsContactModalOpen(true);
  };

  const onBakeryUpdate = () => {
    closeBakeryModal();
    fetchBakeries();
  };

  const onContactUpdate = () => {
    closeContactModal();
    fetchContacts();
  };

  // Toggle between Contacts and Bakeries tabs
  const switchTab = (tab) => {
    setActiveTab(tab);
  };

  return (
    <>
      {/* Navigation buttons to switch tabs */}
      <div className="tabs">
        <button onClick={() => switchTab("contacts")}>Contacts</button>
        <button onClick={() => switchTab("bakeries")}>Bakeries</button>
      </div>

      {/* Show Contacts section if activeTab is "contacts", otherwise show Bakeries */}
      {activeTab === "contacts" && (
        <div className="section">
          
          <ContactList contacts={contacts} updateContact={openEditContactModal} updateCallback={onContactUpdate} />
          <button onClick={openCreateContactModal}>Create New Contact</button>
        </div>
      )}

      {activeTab === "bakeries" && (
        <div className="section">
          
          <BakeryList bakeries={bakeries} updateBakery={openEditBakeryModal} updateCallback={onBakeryUpdate} />
          <button onClick={openCreateBakeryModal}>Create New Bakery</button>
        </div>
      )}

      {/* Bakery Modal */}
      {isBakeryModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <span className="close" onClick={closeBakeryModal}>
              &times;
            </span>
            <BakeryForm existingBakery={currentBakery} updateCallback={onBakeryUpdate} />
          </div>
        </div>
      )}

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
    </>
  );
}

export default App;
