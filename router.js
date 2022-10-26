// const axios = require("axios");
const { Router } = require("express");
const { getRequest, decodeResponse } = require("./order");

const router = Router();
module.exports = router;

router.get("/", (req, res) => {
  const orderId = Date.now();
  const { envKey, envData } = getRequest(orderId);
  // const formData = {
  //   env_key: envKey,
  //   data: envData,
  // };
  // axios
  //   .post(process.env.MOBILPAY_URL, formData, {
  //     headers: {
  //       "Content-Type": "application/x-www-form-urlencoded",
  //     },
  //   })
  //   .then((response) => {
  //     res.send(response.data);
  //   });
  return res.send(`
    <form action="${process.env.MOBILPAY_URL}" method="post">
      <input type="hidden" name="env_key" value="${envKey}" />
      <input type="hidden" name="data" value="${envData}" />
      <input type="submit" value="Pay" />
    </form>
  `);
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

router.get("/return", (req, res) => {
  const { orderId } = req.query;
  return res.send(`Order ${orderId} was paid`);
});
