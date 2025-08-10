import { createContext, useContext, useState } from "react";
import news from "../data/news"
const AdminTab = createContext();
function AdminTabProvider({children}){
    const [activeTab, setActiveTab] = useState("students");
    const [newsData, setNewsData] = useState(news);

const [announcement, setAnnouncement] = useState({
   id: Date.now(),
    title: "",
    date: new Date().toLocaleDateString(),
    description: "",
    author: ""
  });
  function handleTab(e) {
    setActiveTab(e.target.value);
  }
function handleAnnouncement(e){
setAnnouncement({
      ...announcement,
      [e.target.name]: e.target.value,
    }); 
}
  

  function handleSubmit(e) {
    e.preventDefault();
    const newAnnouncement = {
    ...announcement,
    id: Date.now(), // ✅ unique numeric ID
    date: new Date().toLocaleDateString()
  };
  setNewsData([ newAnnouncement,...newsData,]);

    }

return(
    <AdminTab.Provider value={{activeTab,handleTab, handleSubmit,newsData,handleAnnouncement}} >
        {children}
    </AdminTab.Provider>
)
}
function useAdminTab(){
    const adminTab = useContext(AdminTab)
    if(adminTab === undefined) throw new Error("Hook is used outside use case")
        return adminTab
}

export {AdminTabProvider, useAdminTab};