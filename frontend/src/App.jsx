import { useState } from "react";
import BakerySection from "./Bakerysection";
import ContactSection from "./ContactSection";
import PastrySection from "./PastrySection";
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
      </div>

      {/* Shows the activetab*/}
      {activeTab === "contacts" && <ContactSection />}
      {activeTab === "bakeries" && <BakerySection />}
      {activeTab === "pastries" && <PastrySection />}
    </>
  );
}

export default App;
