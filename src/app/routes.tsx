import { createBrowserRouter } from "react-router";
import { Homepage } from "./pages/Homepage";
import { SignIn } from "./pages/SignIn";
import { Dashboard } from "./pages/Dashboard";
import { PredictDisease } from "./pages/PredictDisease";
import { PredictionResults } from "./pages/PredictionResults";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Homepage,
  },
  {
    path: "/signin",
    Component: SignIn,
  },
  {
    path: "/dashboard",
    Component: Dashboard,
  },
  {
    path: "/predict",
    Component: PredictDisease,
  },
  {
    path: "/results",
    Component: PredictionResults,
  },
]);
