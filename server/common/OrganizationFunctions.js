const User = require("../models/User");
const Organization = require("../models/Organization");
const CTItem = require("../models/CTItem");

class OrganizationFunctions{
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
                    resolve({isValid: valid, orgId: org._id});
                }
            });
        });
    }

    async OrgHasItem(orgName, itemSn){
        return new Promise((resolve,reject) => {
            let hasItem = false;
            //find item
            Organization.findOne({_name_lower: orgName.toLowerCase()}, (err, org) => {
                if(err || !org) {console.log(err); reject("Error finding the specified organization.");}
                if(org){
                    CTItem.findOne({organizationId: org._id, serialNumber: itemSn}, (err, item) => {
                        if(item){ hasItem = true;}
                        resolve(hasItem);
                    })
                }
            })
        })
    }
}

module.exports = new OrganizationFunctions();
