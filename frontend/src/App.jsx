import { useState } from "react";
import BakerySection from "./components/BakerySection";
import ContactSection from "./components/ContactSection";
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
      </div>

      {/* Shows the activetab*/}
      {activeTab === "contacts" && <ContactSection />}
      {activeTab === "bakeries" && <BakerySection />}
    </>
  );
}

export default App;
