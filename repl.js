

const users = require("./models/User")


users.findOne({id:5, email: "erickhouse01@yahoo.com"}).then((val) => console.log(val))








// users.save({
//     email: "erickhouse01@yahoo.com",
//     merchantId: 234324,
//     type: 1
// });

//let user = findOne({id:1});

//let i = 0;