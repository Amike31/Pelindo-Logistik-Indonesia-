const oracledb = require('oracledb');
require('dotenv').config();

oracledb.initOracleClient({ libDir: process.env.ORACLE_CLIENT_LIB });

async function connect() {
    return await oracledb.getConnection({
        user: process.env.ORACLE_USER,
        password: process.env.ORACLE_PASSWORD,
        connectString: process.env.ORACLE_CONNECTION_STRING
    });
}

module.exports = connect;