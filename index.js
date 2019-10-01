import express from "express"
import bodyParser from "body-parser"

const fs = require("fs")
const util = require('util')
const write = util.promisify(fs.writeFile);
const app = express()
const { exec } = require('child_process');

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

app.get('/test', (req, res) => {
  res.status(200).send({
    success: "true",
    message: "hello",
  })
})

const writeFile = async (language, code) => {
  let file = ""

  switch(language) {
    case "python":
      file = "python.py"
      break
    case "javascript":
      file = "javascript.js"
      break
    case "ruby":
      file = "ruby.rb"
      break
    default:
      break
  }

  try {
    write(`./files/${file}`, code, err => {
      if(err) { return err }
  
      console.log(`The ${language} file was saved!`)
    })
  } catch (err) {
    console.log(err)
  }
}

app.post("/python", async (req, res) => {
  // Step 1 - Write code to file
  await writeFile("python", req.body.code) 
  // Now ./files/python.py contains code - need to execute and return stdout or stderr
  exec("python ./files/python.py", (err, stdout, stderr) => {
    if (err) { console.log(err) }
    // the *entire* stdout and stderr (buffered)
    console.log(`stdout: ${stdout}`)
    console.log(`stderr: ${stderr}`)
  })

  res.status(200).send({
    success: "true",
    message: "Compiled Python!",
  })
})

app.post("/javascript", async (req, res) => {
  // Step 1 - Write code to file
  await writeFile("javascript", req.body.code)
  // Now ./files/javascript.js contains code - need to execute and return stdout or stderr
  exec("node ./files/javascript.js", (err, stdout, stderr) => {
    if (err) { console.log(err) }
    // the *entire* stdout and stderr (buffered)
    console.log(`stdout: ${stdout}`)
    console.log(`stderr: ${stderr}`)
  })

  res.status(200).send({
    success: "true",
    message: "Compiled Javascript!",
  })
})

app.post("/ruby", async (req, res) => {
  // Step 1 - Write code to file
  await writeFile("ruby", req.body.code)
  // Now ./files/ruby.rb contains code - need to execute and return stdout or stderr
  exec("ruby ./files/ruby.rb", (err, stdout, stderr) => {
    if (err) { console.log(err) }
    // the *entire* stdout and stderr (buffered)
    console.log(`stdout: ${stdout}`)
    console.log(`stderr: ${stderr}`)
  })

  res.status(200).send({
    success: "true",
    message: "Compiled Ruby!",
  })
})

const PORT = 5000

app.listen(PORT, () => {
  console.log(`server running on port ${PORT}`)
})
