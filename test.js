let Salesforce = require("./dist/index.js");
let salesforce = new Salesforce(" ", " ");

const main = () => {
    salesforce.createConnection()
        .then(conn => {
            return conn.query("Select FirstName__c FROM Ablb_User__c")
        })
        .then(results => {
            console.log(results.records);
        })
        .catch(ex => console.log(ex));
};

main();

