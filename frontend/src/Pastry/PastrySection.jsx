import { useState, useEffect } from "react";
import PastryList from "./PastryList";
import PastryForm from "./PastryForm";

const PastrySection = ({ updateCallback }) => {
  const [pastries, setPastries] = useState([]);
  const [isPastryModalOpen, setIsPastryModalOpen] = useState(false);
  const [currentPastry, setCurrentPastry] = useState({});

  useEffect(() => {
    fetchPastries();
  }, []);

  const fetchPastries = async () => {
    const response = await fetch("http://127.0.0.1:5000/pastries");
    const data = await response.json();
    setPastries(data.pastries);
  };

  const closePastryModal = () => {
    setIsPastryModalOpen(false);
    setCurrentPastry({});
  };

  const openCreatePastryModal = () => {
    setIsPastryModalOpen(true);
  };

  const openEditPastryModal = (pastry) => {
    setCurrentPastry(pastry);
    setIsPastryModalOpen(true);
  };

  const onPastryUpdate = () => {
    closePastryModal();
    fetchPastries();
  };

  return (
    <div>
      <PastryList
        pastries={pastries}
        updatePastry={openEditPastryModal}
        updateCallback={onPastryUpdate}
      />
      <button onClick={openCreatePastryModal}>Create New Pastry</button>

      {/* Pastry Modal */}
      {isPastryModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <span className="close" onClick={closePastryModal}>
              &times;
            </span>
            <PastryForm
              existingPastry={currentPastry}
              updateCallback={onPastryUpdate}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default PastrySection;
