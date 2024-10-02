const Auth = require("../models/auth.model");

const { OAuth2Client } = require("google-auth-library");
const client_id = process.env.GG_CLIENT_ID;
const client = new OAuth2Client(client_id);

async function verifyToken(token) {
  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: client_id,
  });
  const payload = ticket.getPayload();
  return payload;
}

module.exports.goggleLogin = async (req, res) => {
  const { token } = req.body;
  const payload = await verifyToken(token);
  const { email, name, sub } = payload;
  let account = await Auth.findOne({
    email,
    goggleId: sub,
  });
  if (!account) {
    account = await Auth.create({
      email: email,
      fullName: name,
      goggleId: sub,
      deleted: false,
    });
  }
  return res.json({
    code: 200,
    message: "Success",
  });
};
