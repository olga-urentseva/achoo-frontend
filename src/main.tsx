import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.css";
import { PageLayout } from "./components/templates/PageLayout/PageLayout";
import { HomePage } from "./components/pages/HomePage/HomePage";
import { AllergensPage } from "./components/pages/AllergensPage/AllergensPage";
import { AboutPage } from "./components/pages/AboutPage/AboutPage";

// Routing only — pages still fetch with the React 19 `use` hook, never loaders.
const router = createBrowserRouter([
  {
    element: <PageLayout />,
    children: [
      { path: "/", element: <HomePage /> },
      { path: "/allergens", element: <AllergensPage /> },
      { path: "/about", element: <AboutPage /> },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);
