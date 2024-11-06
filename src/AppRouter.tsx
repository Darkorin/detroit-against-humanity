import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Card from "./Components/Card";
import CardCreator from "./Pages/CardCreator";

interface RouterProps {}

export default (props: RouterProps) => {
  return (
    <Router>
      <Routes>
      <Route path="*" element={<CardCreator />} />
      </Routes>
    </Router>
  );
};
