import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import Header from "./components/Header";
import ContentSettings from "./pages/ContentSettings";
import Dashboard from "./pages/Dashboard";
import ScheduledPostsWrapper from "./pages/ScheduledPostsWrapper";

function App() {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route
          path="/content-settings/:accountId"
          element={<ContentSettings />}
        />
        <Route
          path="/scheduled-posts/:accountId"
          element={<ScheduledPostsWrapper />}
        />
      </Routes>
      <ToastContainer />
    </Router>
  );
}

export default App;
