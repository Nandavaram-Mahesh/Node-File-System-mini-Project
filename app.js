const { watch } = require('node:fs/promises');
const fs = require('node:fs/promises')


async function createFile(path) {      /*Working Perfectly */
        
    try{

        //  Try to open the file using the path
        let existingFile = await fs.open(path,'r');
        // if the file doesn't exists an error is thrown 
        existingFile.close()

        return console.log("fileExists")

    }catch(e){
        let newFile = await fs.open(path,"w")
        console.log("A new file was successfully created.");
        newFile.close()
        
    }
     
}
async function renameFile(oldPath,newPath){    
    try{
        await fs.rename(oldPath,newPath)
    }
    catch(e){
        console.log(`error:${e}`)
    }
}
async function deleteFile(path){           /*Working Perfectly */
    try{
        await fs.unlink(path)
    }catch(e){
        console.log(e)
    }
}

async function addToFile(path,content){    /*Working Perfectly */

    try{
        await fs.appendFile(path,content)
    }catch(e){
        console.log(`error:${e}`)
    }
}

async function fileWatch() {
    
    const CREATE_FILE = "create a file"
    const RENAME_FILE = "rename a file"
    const DELETE_FILE = "delete a file"
    const ADD_TO_FILE = "add to file"


    try {

       
        // for opening the file
        const fileHandler = await fs.open('./file.txt', "r")

        //  Custom eventEmitter (All <FileHandle> objects are <EventEmitter>s. it means they extend evenEmitter)

        fileHandler.on("change", async () => {

            // getting the size of the file (i.e no of bytes)
            const fileSize = (await fileHandler.stat()).size

            // allocating the buffer 
            const buff = Buffer.alloc(fileSize)

            // the location at which we want to start filling our buffer from 
            const offset = 0

            // length of the buffer in bytes
            const length = buff.byteLength

            // the location at which we want to start reading the file from
            const position = 0

            // Finally Reading a file
            await fileHandler.read(buff, offset, length, position)


            /*
                decoder => takes 0's, 1's and converts them to something meaningful (like characters, image, video...)
                encoder => it takes something meaningful and converts them into 0's, 1's.
             */

            const command = buff.toString('utf-8')
            console.log(command)

            // read the command - create a file
            // create a file <path>
            if (command.includes(CREATE_FILE)) {
                const filePath = command.substring(CREATE_FILE.length+1)
                console.log(`filePath:${filePath}`)
                createFile(filePath)
                
            }
            // rename the file <oldPath> to <newPath>
            if (command.includes(RENAME_FILE)) {
                
                const _idx = command.indexOf(" to")
                const oldPath = command.substring(RENAME_FILE.length+1,_idx)
                const newPath =  command.substring(_idx+4)
                console.log(`oldfilePath:${oldPath} , newFilePath:${newPath}`)
                
                renameFile(oldPath,newPath)
            }

            // delete file <filePath>
            if (command.includes(DELETE_FILE)) {
                const filePath = command.substring(DELETE_FILE.length+1)
                console.log(`filePath:${filePath}`)
                deleteFile(filePath)
            }

            // add to file <filePath>: 
            if (command.includes(ADD_TO_FILE)) {
                const endIndex = command.indexOf(":")
                const filePath = command.substring(ADD_TO_FILE.length+1,endIndex)
                const content =  command.substring(endIndex+1)
                console.log(`filePath:${filePath}`)
                addToFile(filePath,content)
            }



        })

        // for watching the changes in the file
        const watcher = watch('./file.txt')

        for await (const event of watcher) {     /* watcher function returns a asyncIterator */

            console.log(event)  /* outPut: { eventType: 'change', filename: 'file.txt' } */

            if (event.eventType === "change") {

                /*  
                   File change is detected so next i want to read the content of the file 
                   In order to read the file , first file should be opened then we can read/write to the file.
                   
                   note: whenever a file is opened its data is not copied into memory , instead an id is given
                   to the file and it is stored in the memory. it is termed as file descriptor 
                */
                console.log("change detected and emitting")
                fileHandler.emit("change")


            }
        }
    } catch (error) {
        console.log(error)
    }
    
}

fileWatch()