import express from 'express';

const app = express();

app.get('/test', (req, res) => {
  res.status(200).send({
    success: 'true',
    message: 'hello',
  })
});

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`server running on port ${PORT}`)
});
