import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import CardCreator from "./Pages/CardCreator";
import HomePage from "./Pages/HomePage";
import Game from "./Pages/Game";

export default () => {
  return (
    <Router>
      <Routes>
        <Route path="/card-creator" element={<CardCreator />} />
        <Route path="/game" element={<Game />} />
        <Route path="/*" element={<HomePage />} />
      </Routes>
    </Router>
  );
};
