import { useState } from "react";
import BakerySection from "./Bakery/Bakerysection";
import ContactSection from "./Contact/ContactSection";
import PastrySection from "./Pastry/PastrySection";
import BakeryReviewSection from "./BakeryReview/BakeryReviewSection";
import PastryReviewSection from "./PastryReview/PastryReviewSection";
import "./App.css";


function App() {
  const [activeTab, setActiveTab] = useState("contacts");

  const switchTab = (tab) => {
    setActiveTab(tab);
  };

  return (
    <>
      {/* Tab navigation */}
      <div className="tabs">
        <button onClick={() => switchTab("contacts")}>Contacts</button>
        <button onClick={() => switchTab("bakeries")}>Bakeries</button>
        <button onClick={() => switchTab("pastries")}>Pastries</button>
        <button onClick={() => switchTab("bakeryreviews")}>Bakery Reviews</button>
        <button onClick={() => switchTab("pastryreviews")}>Pastry Reviews</button>
      </div>

      {/* Shows the activetab*/}
      {activeTab === "contacts" && <ContactSection />}
      {activeTab === "bakeries" && <BakerySection />}
      {activeTab === "pastries" && <PastrySection />}
      {activeTab === "bakeryreviews" && <BakeryReviewSection/>}
      {activeTab === "pastryreviews" && <PastryReviewSection/>}
    </>
  );
}

export default App;
