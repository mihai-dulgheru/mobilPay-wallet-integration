const { Router } = require("express");
const { getRequest, decodeResponse, getPayment } = require("./order");

const router = Router();
module.exports = router;

router.get("/", (req, res) => {
  const orderId = Date.now();
  const payment = getPayment(orderId, 1, "RON");
  const { envKey, envData } = getRequest(orderId);
  return res.send(`
    <pre>${JSON.stringify(payment.order.invoice, null, 2)}</pre>
    <form action="${process.env.MOBILPAY_URL}" method="post">
      <input type="hidden" name="env_key" value="${envKey}" />
      <input type="hidden" name="data" value="${envData}" />
      <input type="submit" value="Pay" />
    </form>
  `);
});

router.post("/confirm", async (req, res) => {
  const { env_key, data } = req.body;
  console.log({ env_key, data });

  const confirmedPayment = await decodeResponse({ env_key, data });
  console.log(confirmedPayment);

  const action = confirmedPayment.order.mobilpay.action;
  switch (action) {
    case "confirmed":
      console.log("Payment confirmed");
      break;
    case "paid":
      console.log("Payment paid");
      break;
    case "paid_pending":
      console.log("Payment paid pending");
      break;
    case "confirmed_pending":
      console.log("Payment confirmed pending");
      break;
    default:
      console.log("Payment unknown:", action);
  }

  const errorObj = confirmedPayment.order.mobilpay.error;
  let errorMessage = errorObj._;
  let errorCode = errorObj.$.code;

  res.setHeader("Content-Type", "application/xml");
  if (parseInt(errorCode) !== 0) {
    return res.send(
      `<?xml version="1.0" encoding="utf-8" ?><crc error_code="${errorCode}">${errorMessage}</crc>`
    );
  }
  return res.send(
    `<?xml version="1.0" encoding="utf-8" ?><crc>${errorMessage}</crc>`
  );
});

router.get("/return", (req, res) => {
  const { orderId } = req.query;
  return res.send(`Order ${orderId} was paid`);
});
