const express = require("express");
const multer = require("multer");
const azureStorage = require("azure-storage");
const fs = require("fs");

const app = express();
const port = process.env.PORT || 3000;

const storageAccount = "tattelstorage";
const storageAccessKey =
  "TS6iVGX0SSeueh9O80pwr72NNhKGDb+af3dMZOLezJmeDRU3fAWkNoyJL0PsqY9k8Lca5dNXhN//E8HS7qg/ZQ==";
const containerName = "tattel-storage-service";

// Create a BlobServiceClient object using your Azure Storage credentials
const blobService = azureStorage.createBlobService(
  storageAccount,
  storageAccessKey
);

// Set up multer for file uploads
const upload = multer({ dest: "uploads/" });

// Serve HTML form for uploading images
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

// Handle file upload
app.post("/upload", upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).send("No file uploaded.");
  }

  const blobName = req.file.originalname;
  const blobPath = req.file.path;

  // Upload the file to Azure Blob Storage
  blobService.createBlockBlobFromLocalFile(
    containerName,
    blobName,
    blobPath,
    (error, result, response) => {
      if (error) {
        return res
          .status(500)
          .send("Error uploading file to Azure Blob Storage.");
      }

      const blobUrl = blobService.getUrl(containerName, blobName);

      // Remove the temporary local file
      fs.unlinkSync(blobPath);

      return res.send(`File uploaded successfully. Blob URL: ${blobUrl}`);
    }
  );
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
