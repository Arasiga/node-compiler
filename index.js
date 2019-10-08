const express = require("express")
const bodyParser = require("body-parser")
const fs = require("fs")
const util = require('util')
const write = util.promisify(fs.writeFile)
const app = express()
const exec = util.promisify(require('child_process').exec);
const server = require('http').Server(app);
const io = require('socket.io')(server);

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))


const writeFile = async (language, code) => {
  // This function will write code to a specific file
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
    case "output":
      file = "output.txt"
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

const execute = (command) => {
  // This function will execute the code and write the output to output.txt file
  return new Promise((resolve, reject) => {
    exec(command, async (err, stdout, stderr) => {
      if (err) { await writeFile("output", err) }
      else if (stdout) { await writeFile("output", stdout) }
      else if (stderr) { await writeFile("output", stderr) }
      resolve("Done!")
    })
  })
}

const readOutput = () => {
  // Reads the output file and returns a promise with the result
  return new Promise((resolve, reject) => {
    fs.readFile("./files/output.txt", "utf-8", (err, data) => {
      if (err) { reject(err) }
      else if (data || data === "") { resolve(data) }
    })
  })
}

const clearOutputFile = () => {
  // This function clears the output file so that the next call isn't affected
  return new Promise((resolve, reject) => {
    fs.writeFile("./files/output.txt", "", () => resolve("Done clearing file") )
  })
}

// API ENDPOINTS TO COMPILE CODE

app.post("/python", async (req, res) => {
  // Step 1 - Write code to file
  await writeFile("python", req.body.code) 
  // Now ./files/python.py contains code - need to execute and return stdout or stderr
  await execute("python ./files/python.py")
  // Read result from code execution and store in variable output
  let output = await readOutput()
  // Before we send output need to clear the output file
  await clearOutputFile()
  // Send output
  res.status(200).send({
    success: "true",
    message: "Compiled Python!",
    output: output
  })
})

app.post("/javascript", async (req, res) => {
  // Step 1 - Write code to file
  await writeFile("javascript", req.body.code)
  // Now ./files/javascript.js contains code - need to execute and return output
  await execute("node ./files/javascript.js")
  // Read result from code execution and store in variable output
  let output = await readOutput()
  // Before we send output need to clear the output file
  await clearOutputFile()
  // Send output
  res.status(200).send({
    success: "true",
    message: "Compiled Javascript!",
    output: output
  })
})

app.post("/ruby", async (req, res) => {
  // Step 1 - Write code to file
  await writeFile("ruby", req.body.code)
  // Now ./files/ruby.rb contains code - need to execute and return stdout or stderr
  await execute("ruby ./files/ruby.rb")
  // Read result from code execution and store in variable output
  let output = await readOutput()
  // Before we send output need to clear the output file
  await clearOutputFile()
  // Send output
  res.status(200).send({
    success: "true",
    message: "Compiled Ruby!",
    output: output
  })
})

// LIVE INTERACTIONS DONE WITH WEB SOCKETS

io.on("connect", socket => {
  // User is connected to the socket
  console.log("got user connection!")
  // Event for joining a room
  socket.on("join_room", room => {
    socket.join(room)
  })

  // Event for leaving a room
  socket.on("leave_room", room => {
    socket.leave(room)
  })

  // Event for setting language in room
  socket.on("set_language", (room, language) => {
    io.to(room).emit("receive_language", language)
  })

  // Event for sending live code in room
  socket.on("send_code", (room, code) => {
    io.to(room).emit("receive_code", code)
  })

  // Event for sending compiled code in room
  socket.on("send_compiled_code", (room, output) => {
    io.to(room).emit("receive_compiled_code", output)
  })

})

const PORT = 5000

server.listen(PORT, () => {
  console.log(`server running on port ${PORT}`)
})
