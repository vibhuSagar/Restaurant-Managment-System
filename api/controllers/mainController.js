
let groupData = (obj) => {
  var types = getDifferentTypes(obj, 'type');
  var data = {}

  for(var i=0;i<types.length;i++){
    data[types[i]] = []
  }

  for(var i=0;i<obj.length;i++){
    data[obj[i].type].push({iid: obj[i].iid, name: obj[i].name, price: obj[i].price})
  }

  return data;
}

let getDifferentTypes = (obj, type) => {
  data = []

  for(var i=0;i<obj.length;i++){
    if(!data.includes(obj[i][type]))
      data.push(obj[i][type])
  }

  return data
}

let getRepeatingCount = (obj) => {

  var types = getDifferentTypes(obj, 'name');
  var counts = [], count=0;
  for(var i=0;i<types.length;i++)
    if(obj[i].name == types[i])
      count++;
    else {
      counts.push(count)
    }

  return counts
}

module.exports = {
  groupData,
  getDifferentTypes,
  getRepeatingCount
}
