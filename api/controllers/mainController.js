
let groupData = (obj) => {
  var types = getDifferentTypes(obj);
  var data = {}

  for(var i=0;i<types.length;i++){
    data[types[i]] = []
  }

  for(var i=0;i<obj.length;i++){
    data[obj[i].type].push({iid: obj[i].iid, name: obj[i].name, price: obj[i].price})
  }

  return data;
}

let getDifferentTypes = (obj) => {
  data = []

  for(var i=0;i<obj.length;i++){
    if(!data.includes(obj[i].type))
      data.push(obj[i].type)
  }

  return data
}

module.exports = {
  groupData
}
