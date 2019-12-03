/* eslint-disable no-console */
const express = require('express');
const mysql = require('promise-mysql');
const configs = require('./configs/default');

const app = express();

app.listen(4000, () => console.log('Server started on port 4000'));

async function connect() {
  const con = await mysql.createConnection(configs);
  return con;
}


const search = async (keyword) => {
  const con = await connect();
  try {
    const result = await con.query(`
        SELECT id, name, address 
        FROM users 
        WHERE MATCH(address) AGAINST ('${keyword}' IN BOOLEAN MODE) 
        LIMIT 10;
      `);

    await con.end();
    return result;
  } catch (err) {
    await con.end();
    throw new Error(err);
  }
};


app.get('/:keyword', async (req, res) => {
  try {
    const searchResults = await search(req.params.keyword);
    res.json({
      isError: false,
      results: searchResults,
    });
  } catch (err) {
    console.error(err);
    res.json({
      isError: true,
      message: err.message,
    });
  }
});
