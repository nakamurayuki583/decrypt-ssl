const express = require("express");
const fs = require("fs");
const { exec } = require("child_process");
const path = require("path");

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.static("views"));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "index.html"));
});

app.post("/decrypt", (req, res) => {
  const encryptedKey = req.body.encryptedKey;
  const passphrase = req.body.passphrase;

  const inputPath = "./temp_encrypted.key";
  const outputPath = "./temp_decrypted.key";

  fs.writeFileSync(inputPath, encryptedKey);

  const cmd = `openssl rsa -in ${inputPath} -passin pass:${passphrase} -out ${outputPath}`;

  exec(cmd, (error, stdout, stderr) => {
    if (error) {
      return res.send(`<pre style="color:red;">Gagal mendekripsi private key.\n${stderr}</pre><br><a href="/">Kembali</a>`);
    }

    const decryptedKey = fs.readFileSync(outputPath, "utf8");

    fs.unlinkSync(inputPath);
    fs.unlinkSync(outputPath);

    res.send(`
      <h3>Private Key yang sudah didekripsi:</h3>
      <textarea id="output" rows="20" style="width:100%;">${decryptedKey}</textarea><br>
      <button onclick="copy()">Copy ke Clipboard</button><br><br>
      <a href="/">← Kembali</a>

      <script>
        function copy() {
          const textarea = document.getElementById("output");
          textarea.select();
          document.execCommand("copy");
          alert("Disalin ke clipboard!");
        }
      </script>
    `);
  });
});

app.listen(3000, () => {
  console.log("✅ Jalankan di http://localhost:3000");
});
