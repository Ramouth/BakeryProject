import { useState, useEffect } from "react";
import BakeryList from "./BakeryList";
import "./App.css";
import BakeryForm from "./BakeryForm";

function App() {
  const [bakeries, setBakeries] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentBakery, setCurrentBakery] = useState({});

  useEffect(() => {
    fetchBakeries();
  }, []);

  const fetchBakeries = async () => {
    const response = await fetch("http://127.0.0.1:5000/bakeries");
    const data = await response.json();
    setBakeries(data.bakeries);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentBakery({});
  };

  const openCreateModal = () => {
    if (!isModalOpen) setIsModalOpen(true);
  };

  const openEditModal = (bakery) => {
    if (isModalOpen) return;
    setCurrentBakery(bakery);
    setIsModalOpen(true);
  };

  const onUpdate = () => {
    closeModal();
    fetchBakeries();
  };

  return (
    <>
      <BakeryList bakeries={bakeries} updateBakery={openEditModal} updateCallback={onUpdate} />
      <button onClick={openCreateModal}>Create New Bakery</button>
      {isModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <span className="close" onClick={closeModal}>
              &times;
            </span>
            <BakeryForm existingBakery={currentBakery} updateCallback={onUpdate} />
          </div>
        </div>
      )}
    </>
  );
}

export default App;
