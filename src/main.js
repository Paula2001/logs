const connect = require('./databases/mysql8');

// const TailingReadableStream = require('tailing-stream');
//
// const stream = TailingReadableStream.createReadStream("sad", {timeout: 0});
//
// stream.on('data', buffer => {
//     console.log(buffer.toString());
// });
// stream.on('close', () => {
//     console.log("close");
// });
const ipc = window.require('electron').ipcRenderer;
document.getElementById('connect').onclick = async function () {
    let response = await ipc.invoke('connectToDatabase',{
        host: document.getElementById('host').value,
        password: document.getElementById('password').value,
        user: document.getElementById('name').value,
        port: parseInt(document.getElementById('port').value)
    });

    if (response)
        alert(await response);
}
