import { useState } from "react";
import BakerySection from "./Bakerysection";
import ContactSection from "./ContactSection";
import PastrySection from "./PastrySection";
import BakeryReviewSection from "./BakeryReviewSection";
import PastryReviewSection from "./PastryReviewSection";
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
