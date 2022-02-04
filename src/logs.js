const ipc = window.require('electron').ipcRenderer;
const { exec } = require("child_process");
const path = require('path');
let fixedURL = path.join(__dirname, '/scripts/');

const getLogsStatus = async () => {
    let response = await ipc.invoke('getGeneralLogsStatus');
    document.getElementById('logs_switch').checked = response === "ON" ;
}

document.getElementById('logs_switch').onchange = async (val) => {
    await ipc.invoke('editGeneralLogsStatus' , val.target.checked ? "ON" : "OFF")
}

let fileSize = 0;
const getFileSizeAndGetDataIfDifferent = (password ,closure ,logFile ) => {
    exec(`${fixedURL}/getFileSize "${password}" ${logFile}`, (error, stdout, stderr) => {
        const newFileSize = parseInt([...stdout.matchAll(/\d+/g)][1][0]);
        if (fileSize < newFileSize){
            closure();
        }
        fileSize = newFileSize;
    });
}

const getData = (password ,datatable ,logFile) => {
    exec(`${fixedURL}/getFileContent "${password}" "${logFile}"`, (error, stdout, stderr) => {
        const dataSet = [];
        const data = [...stdout.matchAll(/((\d+-\d+-\w+:\d+:\d+.\w+)(\s+\d+\s)(.*)\n)/g)];
        data.forEach((datum) => {
            dataSet.push([datum[2],datum[3], datum[4]]);
        })
        datatable.clear();
        datatable.rows.add(dataSet);
        datatable.draw();
    });
}

const longPolling = (password, datatable ,log_file) => {
    setInterval(() => {
        let longPolling = document.getElementById('long_polling').checked;
        if(longPolling) {
            getFileSizeAndGetDataIfDifferent(password,async()=> {
                await getData(password ,datatable ,log_file);
            } ,log_file)
        }
}, 1000);
}


const getUserRootPassword = async () => {
    return await ipc.invoke('getUserRootPassword');
}

const runProject = async () => {
    let datatable ;
    let log_file = await ipc.invoke('getGeneralLogsFilePath');
    $(document).ready(function() {
        datatable = $('#example').DataTable( {
            scrollY: '70vh',
            order: [[ 0, "desc" ]],
            scrollCollapse: true,
            columns: [
                { title: "Date"  },
                { title: "ID" },
                { title: "Operation and Query" }
            ]
        } );
    });
    await getLogsStatus();
    const password = await getUserRootPassword();
    await getData(password ,datatable , log_file);
    longPolling(password ,datatable , log_file);
}

runProject();
