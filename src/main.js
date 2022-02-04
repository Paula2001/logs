
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
