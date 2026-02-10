import express from "express";
import cors from "cors";
import helmet from "helmet";
import axios from "axios";

const app = express();
const PORT = process.env.PORT || 6000;

const OFFICIAL_EMAIL = "tamanna2223.be23@chitkara.edu.in";
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

app.use(express.json({ limit: "1mb" }));
app.use(cors());
app.use(helmet());

const isPrime = (n) => {
  if (n < 2) return false;
  for (let i = 2; i * i <= n; i++) {
    if (n % i === 0) return false;
  }
  return true;
};

const gcd = (a, b) => (b === 0 ? a : gcd(b, a % b));
const lcm = (a, b) => (a * b) / gcd(a, b);

app.get("/health", (_, res) => {
  res.status(200).json({
    is_success: true,
    official_email: OFFICIAL_EMAIL,
  });
});

app.post("/bfhl", async (req, res) => {
  try {
    const keys = Object.keys(req.body);

    if (keys.length !== 1) {
      return res.status(400).json({
        is_success: false,
        error: "Request must contain exactly one key",
      });
    }

    const key = keys[0];
    const value = req.body[key];
    let data;

    switch (key) {
      case "fibonacci":
        if (!Number.isInteger(value) || value < 0)
          throw "Invalid fibonacci input";

        data = [];
        let a = 0,
          b = 1;
        for (let i = 0; i < value; i++) {
          data.push(a);
          [a, b] = [b, a + b];
        }
        break;

      case "prime":
        if (!Array.isArray(value)) throw "Prime input must be an array";
        data = value.filter((n) => Number.isInteger(n) && isPrime(n));
        break;

      case "lcm":
        if (!Array.isArray(value) || value.length === 0)
          throw "LCM input must be non-empty array";
        data = value.reduce((acc, curr) => lcm(acc, curr));
        break;

      case "hcf":
        if (!Array.isArray(value) || value.length === 0)
          throw "HCF input must be non-empty array";
        data = value.reduce((acc, curr) => gcd(acc, curr));
        break;

      case "AI":
        if (typeof value !== "string") throw "AI input must be a string";

        const aiRes = await axios.post(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
          {
            contents: [{ parts: [{ text: value + ". Answer in one word." }] }],
          },
        );

        data =
          aiRes.data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ||
          "Unknown";
        break;

      default:
        return res.status(400).json({
          is_success: false,
          error: "Invalid key",
        });
    }

    res.status(200).json({
      is_success: true,
      official_email: OFFICIAL_EMAIL,
      data,
    });
  } catch (err) {
    res.status(400).json({
      is_success: false,
      error: err.toString(),
    });
  }
});

app.listen(PORT, () => console.log(`API running on port ${PORT}`));
