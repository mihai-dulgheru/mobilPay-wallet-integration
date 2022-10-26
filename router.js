const axios = require("axios");
const { Router } = require("express");
const { getRequest, decodeResponse } = require("./order");

const router = Router();
module.exports = router;

router.get("/order", (req, res) => {
  const orderId = req.query.orderId;
  const { envKey, envData } = getRequest(orderId);
  const formData = {
    env_key: envKey,
    data: envData,
  };
  axios
    .post(process.env.MOBILPAY_URL, formData, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    })
    .then((response) => {
      res.send(response.data);
    });
});

router.post("/confirm", (req, res) => {
  const { env_key, data } = req.body;
  decodeResponse(env_key, data)
    .then((response) => {
      return res.send(response);
    })
    .catch((err) => {
      return res.send(err);
    });
});
