dbPassword = process.env.PROD_DB;

module.exports = {
  mongoURI: dbPassword,
};

// mongodb://localhost:27017/coding_club
// mongodb+srv://codingClubCtpg:vscode1234@cluster0.plnfpnp.mongodb.net/codingClubCtpg
