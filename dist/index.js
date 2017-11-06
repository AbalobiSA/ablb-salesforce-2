"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsforce = require("jsforce");
const limiter_1 = require("limiter");
const sanitize_filename_1 = require("sanitize-filename");
const fs = require("fs");
const secrets_1 = require("./secrets");
class Salesforce {
    constructor(username, password) {
        this.secrets = new secrets_1.default(username, password);
    }
    /**
     * Creates a manual connection to salesforce and passes back the connection
     * object in a promise
     */
    createConnection() {
        let conn = new jsforce.Connection({});
        console.log("Salesforce: Logging in...");
        return new Promise((resolve, reject) => {
            conn.login(this.secrets.SF_USER, this.secrets.SF_PASSWORD, (err, res) => {
                if (err) {
                    reject(err);
                }
                else {
                    console.log("Salesforce: Login Successful.\n");
                    resolve(conn);
                }
            });
        });
    }
    createSearch(conn, querystring) {
        const removeDashes = (text) => text.split("-").join("\\-");
        return new Promise((resolve, reject) => {
            conn.search(removeDashes(querystring), (err, res) => {
                if (err) {
                    console.log("salesforce: search error: ", err);
                    reject(err);
                }
                else {
                    console.log(`salesforce: search debug: RESPONSES RECEIVED: ${res.searchRecords.length}`);
                    resolve(res);
                }
            });
        });
    }
    /**
     * Update a single record in a table.
     * @param conn
     * @param table
     * @param updateobject
     * @returns {Promise}
     */
    updateSingle(conn, table, updateobject) {
        return new Promise((resolve, reject) => {
            // Single record update
            conn.sobject(table).update(updateobject, function (err, ret) {
                if (err || !ret.success) {
                    // error(err);
                    console.error(err, ret);
                    reject([err, ret]);
                }
                else {
                    console.log('Updated Successfully : ' + ret.id);
                    resolve(ret.id);
                }
            });
        });
    }
    /**
     * Take a single object and create a new Salesforce record in a specific table.
     * Returns a promise with error or success string.
     * @param conn
     * @param tableName
     * @param data
     * @returns {Promise}
     */
    createSingle(conn, tableName, data) {
        // Single record creation
        return new Promise((resolve, reject) => {
            conn.sobject(tableName).create(data, (err, ret) => {
                if (err || !ret.success) {
                    reject(err);
                    return console.error(err, ret);
                }
                else {
                    // Resolve with the created record ID
                    resolve(ret.id);
                }
            });
        });
    }
    createSingleFake(conn, tableName, data) {
        // Single record creation
        return new Promise((resolve, reject) => {
            let currentDate = new Date();
            let dateString = currentDate.toISOString();
            let filename = sanitize_filename_1.default(dateString);
            fs.writeFile("../../" + filename + ".json", JSON.stringify(data, null, 4), (err) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve("FAKE_SALESFORCE_ID");
                }
            });
        });
    }
    /**
     * Takes an array of objects to insert into a Salesforce table.
     * @param conn - Connection passed into this function
     * @param sfObject - Table to insert objects into
     * @param data - Array of data to insert into table
     */
    createMultiple(conn, sfObject, data) {
        let limiter = new limiter_1.RateLimiter(1, 250);
        let splitData = splitArray(data);
        for (let i = 0; i < splitData.length; i++) {
            limiter.removeTokens(1, function () {
                conn.sobject(sfObject).create(splitData[i], (err, rets) => {
                    if (err) {
                        return console.error(err);
                    }
                    for (let i = 0; i < rets.length; i++) {
                        if (rets[i].success) {
                            console.log("Created record id : " + rets[i].id);
                        }
                    }
                });
            });
        }
        // Splits the array of data into chunks of 10
        function splitArray(array) {
            let i, j, temparray, chunk = 10;
            let newArray = [];
            for (i = 0, j = array.length; i < j; i += chunk) {
                temparray = array.slice(i, i + chunk);
                newArray.push(temparray);
            }
            return newArray;
        }
    }
    getFieldNames(conn, sfObject) {
        return new Promise((resolve, reject) => {
            conn.sobject(sfObject)
                .select('*')
                .limit(1)
                .execute(this.getRecords)
                .then(records => {
                let keysArr = [];
                // Build an array of fields in this object
                if (records.length > 0) {
                    for (let i in records[0]) {
                        if (records[0].hasOwnProperty(i)) {
                            keysArr.push(i);
                        }
                    }
                    resolve(keysArr);
                    return;
                }
                else {
                    reject("No records found for " + sfObject);
                }
            }).catch(ex => {
                console.log("Error");
                console.log(ex);
                reject("Error in SalesForce: " + ex);
            });
        });
    }
    /**
     * Promisify function for sfObject execute chain method
     * @param err
     * @param records
     * @returns {Promise}
     */
    getRecords(err, records) {
        return new Promise((resolve, reject) => {
            if (err) {
                reject(err);
            }
            else {
                resolve(records);
            }
        });
    }
    deleteSingle(conn, table, objectId) {
        return new Promise((resolve, reject) => {
            conn.sobject(table).destroy(objectId, function (err, ret) {
                if (err || !ret.success) {
                    reject(err);
                    console.error(err, ret);
                }
                else {
                    resolve(ret.id);
                }
                console.log('Salesforce: Deleted Successfully : ' + ret.id);
            });
        });
    }
    deleteMultiple(conn, table, thingsToDelete) {
        return new Promise((resolve, reject) => {
            let limiter = new limiter_1.RateLimiter(1, 250);
            // let splitData = splitArray(data);
            for (let i = 0; i < thingsToDelete.length; i++) {
                limiter.removeTokens(1, () => {
                    conn.sobject(table).destroy(thingsToDelete[i], (err, ret) => {
                        if (err || !ret.success) {
                            reject(err);
                            console.error(err, ret);
                        }
                        else {
                            resolve(ret.id);
                        }
                        console.log('Salesforce: Deleted Successfully : ' + ret.id);
                    });
                    if (i === thingsToDelete.length - 1) {
                        resolve("All items deleted successfully!");
                    }
                });
            }
        });
    }
}
module.exports = Salesforce;

//# sourceMappingURL=index.js.map
