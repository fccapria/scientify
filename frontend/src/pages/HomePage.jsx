import { useState } from "react";
import SearchBar from "../components/SearchBar";
import PublicationList from "../components/PublicationList";
import UploadModal from "../components/UploadModal";
import { Box } from "@mui/material";

export default function HomePage() {
  const [search, setSearch] = useState("");
  const [uploadOpen, setUploadOpen] = useState(false);
  const [refresh, setRefresh] = useState(false);

  return (
    <Box sx={{ pb: 4 }}>
      <SearchBar value={search} onChange={setSearch} />
      <PublicationList search={search} key={refresh} />
      <UploadModal
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        onUploadSuccess={() => setRefresh(r => !r)}
      />
    </Box>
  );
}