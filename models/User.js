const bcrypt = require('bcrypt-nodejs');
const crypto = require('crypto');
const db = require("./../database/index")

exports.merchantTypes = {
  SQUARE : 1,
  CLOVER : 2
}

const userModel = {
  id : "id",
  email : "email",
  merchantId : "merchant_id",
  type : "merchant_type",
  name : "name",
  accessToken : "access_token"
};

function check(user) {
    for(let key in user) {
      let val = userModel[key];
      if(!val){
        throw `${key} not in user model`;
      }
    }
};

function where(user) {
  let i = 1;
  let expr = [];
  for(let key in user) {
    let val = userModel[key];
    if(val){
      expr.push(`${val} = \$${i}`)
      i++;
    }
  }
  return `where ${expr.join(" and ")}`;
};

function convert(row) {
  if(!row) return undefined;
  return {
    id: row.id,
    email : row.email,
    merchantId : row.merchant_id,
    type : row.merchant_type,
    name : row.name,
    accessToken : row.access_token
  };
}


exports.findOne = async (user) => {
  try {
    check(user);
    const query = {
        text: `
        select * from users
        ${where(user)}
        `,
        values : Object.values(user)
    }
    let res = await db.query(query.text, query.values);
    let found = res && res.rowCount !== 0 ? res.rows[0] : undefined;
    return [undefined, convert(found)];
  } catch(err) {
      console.log(`failed to findOne ${user}`);
      console.log(err);
      return [err, undefined];
  }

}

exports.save = async (user) => {
  try{
    check(user);
    const query = {
      text: `
      insert into users 
      (email, name, merchant_id, merchant_type, access_token)
      values ($1, $2, $3, $4, $5)
      on conflict (merchant_id) 
      do update set 
      email = $1, name = $2, merchant_id = $3, merchant_type = $4, access_token = $5
      `,
      values: [
        user.email,
        user.name,
        user.merchantId,
        user.type,
        user.accessToken
      ],
    }
    await db.query(query.text, query.values);
    console.log(`saved user ${user}`);
  } catch(err) {
      console.log(`failed to save user ${user}`);
      console.log(err);
      return err;
  }
}

exports.removeById = async (id) => {
  try{
    const query = {
      text: `
      delete from users
      where id = $1
      `,
      values: [id],
    }
    await db.query(query.text, query.values);
    console.log(`deleted user ${id}`);
  } catch(err) {
      console.log(`failed to delete user ${id}`);
      console.log(err);
      return err;
  }
}


