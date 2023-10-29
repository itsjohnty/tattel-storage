const express = require("express");
const multer = require("multer");
const {
  BlobServiceClient,
  StorageSharedKeyCredential,
} = require("@azure/storage-blob");
const fs = require("fs");

const app = express();
const port = process.env.PORT || 8080;

const accountName = "tattelstorage";
const accountKey =
  "TS6iVGX0SSeueh9O80pwr72NNhKGDb+af3dMZOLezJmeDRU3fAWkNoyJL0PsqY9k8Lca5dNXhN//E8HS7qg/ZQ==";
const containerName = "tattel-storage-service";

// Create a StorageSharedKeyCredential object
const sharedKeyCredential = new StorageSharedKeyCredential(
  accountName,
  accountKey
);

// Create a BlobServiceClient object using the StorageSharedKeyCredential
const blobServiceClient = new BlobServiceClient(
  `https://${accountName}.blob.core.windows.net`,
  sharedKeyCredential
);

// Set up multer for file uploads
const upload = multer({ dest: "uploads/" });

// Serve HTML form for uploading images
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

// Handle file upload
app.post("/upload", upload.single("image"), async (req, res) => {
  if (!req.file) {
    return res.status(400).send("No file uploaded.");
  }

  const blobName = req.file.originalname;
  const blobPath = req.file.path;

  const containerClient = blobServiceClient.getContainerClient(containerName);
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);

  try {
    // Upload the file to Azure Blob Storage
    await blockBlobClient.uploadFile(blobPath);

    const blobUrl = blockBlobClient.url;

    // Remove the temporary local file
    fs.unlinkSync(blobPath);

    return res.send(`File uploaded successfully. Blob URL: ${blobUrl}`);
  } catch (error) {
    console.error("Error uploading file to Azure Blob Storage:", error);
    return res.status(500).send("Error uploading file to Azure Blob Storage.");
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
