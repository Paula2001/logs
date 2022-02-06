const ipc = window.require('electron').ipcRenderer;
var sudo = require('sudo-js');

const getLogsStatus = async () => {
    let response = await ipc.invoke('getGeneralLogsStatus');
    document.getElementById('logs_switch').checked = response === "ON" ;
}

document.getElementById('logs_switch').onchange = async (val) => {
    await ipc.invoke('editGeneralLogsStatus' , val.target.checked ? "ON" : "OFF")
}

let fileSize = 0;
const getFileSizeAndGetDataIfDifferent = (password ,closure ,logFile ) => {
    let command = ['ls','-l', logFile];
    sudo.exec(command, (error, pid, result) => {
        const newFileSize = parseInt([...result.matchAll(/\d+/g)][1][0]);
        if (fileSize < newFileSize){
            closure();
        }
        fileSize = newFileSize;
    });
}

const getData = (password ,datatable ,logFile) => {
    let command = ['cat', logFile];

    sudo.exec(command, (error, pid, result) => {
        const dataSet = [];
        const data = [...result.matchAll(/((\d+-\d+-\w+:\d+:\d+.\w+)(\s+\d+\s)(.*)\n)/g)];
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


const getUserRootPassword = async (action) => {
    let password =  await ipc.invoke('getUserRootPassword');
    if (password === null){
        await ipc.invoke('close-app');
    }
    sudo.setPassword(password);

    sudo.check( (isLoggedIn)=>{
        if (!isLoggedIn){
            getUserRootPassword(action);
        }else{
            action(password);
        }
    });

}

(async () => {
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
    await getUserRootPassword(async (password) => {
        await getData(password ,datatable , log_file);
        longPolling(password ,datatable , log_file);
    });

})();
