// var problems = [
//   {
//     id:1,
//     name:"test0",
//     desc:"test content 1",
//     difficulty: "easy"
//   },
//   {
//     id:2,
//     name:"test1",
//     desc:"test content 2",
//     difficulty: "mediun"
//   },
//   {
//     id:3,
//     name:"test3",
//     desc:"test content 3",
//     difficulty: "super"
//   }
// ];

var ProblemModel = require('../models/problemModel');

var getProblems = function() {
  return new Promise((resolve, reject) => {
    ProblemModel.find({}, function(err, problems) {
      if (err) {
        reject(err);
      } else {
        resolve(problems);
      }
    });
  });
}

// var getProblems = function() {
//   return new Promise((resolve, reject) => {
//     resolve(problems);
//   });
// }

var getProblem = function(idNumber) {
  return new Promise((resolve, reject) => {
    ProblemModel.findOne({id: idNumber}, function(err, problem) {
      if (err) {
        reject(err);
      } else {
        resolve(problem);
      }
    });
  });
}

// var getProblem = function(id) {
//   return new Promise((resolve, reject) => {
//     resolve(problems.find(problem => problem.id === id ));
//   });
// }

var addProblem = function(newProblem) {
  return new Promise((resolve, reject) => {
    console.log(newProblem.name);
    ProblemModel.findOne({name: newProblem.name}, function(err, data) {
      if (data) {
        reject('Problem already exists');
      } else {
        ProblemModel.count({}, function(err, num) {
          newProblem.id = num + 1;
          var mongoProblem = new ProblemModel(newProblem);
          console.log(mongoProblem);
          mongoProblem.save();
          resolve(mongoProblem);
        });
      }
    });
  });
}

// var addProblem = function(newProblem) {
//   return new Promise((resolve, reject) => {
//     if (problems.find(problem => problem.name === newProblem.name)) {
//       reject('problem name already exists');
//     } else {
//       newProblem.id = problems.length + 1
//       problems.push(newProblem);
//       resolve(newProblem);
//     }
//   });
// }

module.exports = {
  getProblems : getProblems,
  getProblem : getProblem,
  addProblem : addProblem
}
