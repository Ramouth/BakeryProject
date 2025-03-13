import { useState, useEffect } from "react";
import BakeryList from "./BakeryList";
import BakeryForm from "./BakeryForm";

const BakerySection = ({ updateCallback }) => {
  const [bakeries, setBakeries] = useState([]);
  const [isBakeryModalOpen, setIsBakeryModalOpen] = useState(false);
  const [currentBakery, setCurrentBakery] = useState({});

  useEffect(() => {
    fetchBakeries();
  }, []);

  const fetchBakeries = async () => {
    const response = await fetch("http://127.0.0.1:5000/bakeries");
    const data = await response.json();
    setBakeries(data.bakeries);
  };

  const closeBakeryModal = () => {
    setIsBakeryModalOpen(false);
    setCurrentBakery({});
  };

  const openCreateBakeryModal = () => {
    setIsBakeryModalOpen(true);
  };

  const openEditBakeryModal = (bakery) => {
    setCurrentBakery(bakery);
    setIsBakeryModalOpen(true);
  };

  const onBakeryUpdate = () => {
    closeBakeryModal();
    fetchBakeries();
  };

  return (
    <div>
      <h2>Bakeries</h2>
      <BakeryList bakeries={bakeries} updateBakery={openEditBakeryModal} updateCallback={onBakeryUpdate} />
      <button onClick={openCreateBakeryModal}>Create New Bakery</button>

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
    </div>
  );
};

export default BakerySection;
