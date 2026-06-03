import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { PageLayout } from "./components/templates/PageLayout/PageLayout";
import { HomePage } from "./components/pages/HomePage/HomePage";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <PageLayout>
      <HomePage />
    </PageLayout>
  </React.StrictMode>,
);
