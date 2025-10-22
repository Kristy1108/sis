import React, { createContext, useState } from "react";

export const LeaderboardContext = createContext();

export const LeaderboardProvider = ({ children }) => {
  const [showLeaderboardModal, setShowLeaderboardModal] = useState(false);
  const [showExamDetails, setShowExamDetails] = useState(false); // toggle state

  return (
    <LeaderboardContext.Provider value={{
      showLeaderboardModal,
      setShowLeaderboardModal,
      showExamDetails,
      setShowExamDetails
    }}>
      {children}
    </LeaderboardContext.Provider>
  );
};