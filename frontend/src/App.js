import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { CustomThemeProvider } from "./context/ThemeContext";
import AppBarHeader from "./components/AppBarHeader";
import HomePage from "./pages/HomePage";
import UserPublicationsPage from "./pages/UserPublicationsPage";
import { useState } from "react";
import { Box } from "@mui/material";

function App() {
  const [uploadOpen, setUploadOpen] = useState(false);

  return (
    <CustomThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
            <AppBarHeader onUploadClick={() => setUploadOpen(true)} />
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/me" element={<UserPublicationsPage />} />
            </Routes>
          </Box>
        </BrowserRouter>
      </AuthProvider>
    </CustomThemeProvider>
  );
}

export default App;