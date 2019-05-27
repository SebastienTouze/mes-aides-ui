


var id = '5ce6c0f286de4442d0107b4a'

var rp = require('request-promise')

function getBigPicture(payload) {
  return Object.keys(payload.trace).reduce((a, v) => {
    const m = v.match(/(.*)<(.*)>/)
    const variableName = m[1]
    const period = m[2]

    a.v[variableName] = a.v[variableName] || {}
    a.v[variableName][period] = 1

    a.d[period] = (a.d[period] || 0) + 1

    a.dv[period] = a.dv[period] || {}
    a.dv[period][variableName] = 1

    return a;
  }, { v: {}, d: {}, dv: {}})
}

function addParents(payload) {
  var trace = payload.trace;
  var vars = Object.keys(trace);
  vars.forEach((v) => {
    var vd = trace[v];
    vd.sources = vd.sources || new Set();

    vd.dependencies.forEach(d => {
      trace[d].sources = trace[d].sources || new Set();
      trace[d].sources.add(v);
    })
  })
}

function print(trace, variable, level) {
  var msg = ' '.repeat(level) + variable;
  console.log(msg);
  var done = false;
  trace[variable].sources.forEach(s => {
    done = done || print(trace, s, level+1);
  });

  return false;
}

//Promise.resolve(require('./trace.json'))
rp({ uri: 'http://localhost:9000/api/situations/' + id + '/openfisca-trace', json: true })
//.then(d => { console.log(JSON.stringify(d, null, 2)); return d; }) // */
.then(d  => {
  addParents(d)
  console.log(Object.keys(d.trace).length)

  var bp = getBigPicture(d);

  console.log(bp.d)
  console.log(bp.dv['2013-07'])

  var bottom = 'rfr<2015>'
  //print(d.trace, bottom, 0);
})
