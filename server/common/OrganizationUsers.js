const User = require("../models/User");
const Organization = require("../models/Organization");

class OrganizationUserFunctions{
    async OrganizationUserHasPermissionAsync(orgName, userId, permissionLevel){
        return new Promise((resolve, reject) => {
            let valid = false;
            Organization.findOne({_name_lower: orgName.toLowerCase()}, (err, org) => {
                if(err) {console.log(err); resolve(valid);}
                if(org) {
                    for(let i = 0; i < org.users.length; i++){
                        if(String(org.users[i].userId) === String(userId) && org.users[i].permissions >= Number(permissionLevel)){
                            valid = true;
                            break;
                        }
                    }
                    resolve(valid);
                }
            });
        });
    }

    Test(){
        console.log("Test");
    }
}

module.exports = new OrganizationUserFunctions();
