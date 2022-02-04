const mysql = require('@mysql/xdevapi');

class mysql8 {
    async connect(options){
        this.instance = await mysql.getSession(options);
        return this.instance;
    }

    async returnGeneralLogsStatus(){
        let result = await this.instance.sql("SHOW VARIABLES where Variable_name =  'general_log'").execute();
        return result.fetchOne()[1];
    }

    async editGeneralLogsStatus(isActive){ //ON - OFF
        await this.instance.sql(`SET GLOBAL general_log = '${isActive}'`).execute();
    }

    async returnGeneralLogsFile(){
        let result = await this.instance.sql("SHOW VARIABLES where Variable_name =  'general_log_file'").execute();
        return result.fetchOne()[1];
    }

    async editPathOfGeneralLogs(path){
        await this.instance.sql(`SET GLOBAL general_log_file = '${path}'`).execute();
    }

    async closeConnection(){
        console.log('connection with database 8 closed')
        await this.instance.close().catch((err) => console.log(err));
    }
}

module.exports = mysql8;
