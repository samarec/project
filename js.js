function onLoad() {
  var y = [0, 1];
  var counters = [0, 1];

  var ctx = document.getElementById("myChart");

  var data = {
    labels: counters,
    datasets: [{
        label: "ROC",
        fill: false,
        lineTension: 0.1,
        backgroundColor: "rgba(75,192,192,0.4)",
        borderColor: "rgba(75,192,192,1)",
        borderCapStyle: 'butt',
        borderDash: [],
        borderDashOffset: 0.0,
        borderJoinStyle: 'miter',
        pointBorderColor: "rgba(75,192,192,1)",
        pointBackgroundColor: "#fff",
        pointBorderWidth: 1,
        pointHoverRadius: 5,
        pointHoverBackgroundColor: "rgba(75,192,192,1)",
        pointHoverBorderColor: "rgba(220,220,220,1)",
        pointHoverBorderWidth: 2,
        pointRadius: 1,
        pointHitRadius: 10,
        data: y,
        spanGaps: false,
      }
    ]
  };

  var myChart = new Chart(ctx, {
    type: 'line',
    data: data
  });

}

function step(a, s) {
  return (a <= s) ? 0 : 1;
}

var wt = [];
var positionCounter = 0;
var positionMap = {};

document.getElementById('file').onchange = function() {

  var file = this.files[0];

  var globalCounter = {};
  var answersAndFeatures = [];

  var reader = new FileReader();
  reader.onload = function(progressEvent) {

    var lines = this.result.split('\n');
    for (var line = 0; line < lines.length; line++) {

      var words = lines[line].trim().split(/\s+/g);

      var tf = {};
      for (var w = 1; w < words.length; w++) {
        var word = words[w];

        if (!(globalCounter[word] instanceof Set)) {
          globalCounter[word] = new Set();
          positionMap[word] = positionCounter++;
        }
        globalCounter[word].add(line);

        tf[word] = isNaN(tf[word]) ? 1 : tf[word] + 1;
      }

      for (var t in tf) {
        if (tf.hasOwnProperty(t)) {
          tf[t] = tf[t] * 1.0 / (words.length - 1);
        }
      }

      answersAndFeatures[line] = [];
      answersAndFeatures[line][0] = words[0];
      answersAndFeatures[line][1] = tf;
    }
    console.log(globalCounter);

    for (var j = 0; j < answersAndFeatures.length; j++) {
      var tfIdf = answersAndFeatures[j][1];

      var res = [];
      for (var q = 0; q < positionCounter; q++) {
        res[q] = 0;
      }

      for (var tw in tfIdf) {
        if (tfIdf.hasOwnProperty(tw)) {
          var wordTfIdf = tfIdf[tw] * Math.log(lines.length * 1.0 / globalCounter[tw].size);
          var wordPosition = positionMap[tw];
          res[wordPosition] = wordTfIdf;
        }
      }

      answersAndFeatures[j][1] = res;
    }

    console.log(answersAndFeatures);
    console.log(globalCounter.length);

    //var wt = [];
    for (var j = 0; j < positionCounter + 1; j++) {
      wt[j] = 0.1;
    }
    wt = math.matrix(wt);

    var X = [];
    for (var j = 0; j < answersAndFeatures.length; j++) {
      X[j] = [];
      X[j][0] = 1;
      for (var q = 0; q < answersAndFeatures[j][1].length; q++) {
        X[j][q + 1] = answersAndFeatures[j][1][q];
      }
    }
    var mX = math.matrix(X);

    var y = [];
    for (var j = 0; j < answersAndFeatures.length; j++) {
      y[j] = (answersAndFeatures[j][0] == 'rec.autos') ? 1 : 0;
    }
    var mY = math.matrix(y);

    // Iterations.
    for (var iter = 0; iter < 400; iter++) {
      var wtTransp = math.transpose(wt);

      var ss = [];
      for (var j = 0; j < positionCounter + 1; j++) {
        ss[j] = 0;
      }
      var s = math.matrix(ss);
      //console.log(s);

      for (var q = 0; q < answersAndFeatures.length; q++) {
        var mXq = math.matrix(X[q]);
        var f = 1 / (1 + Math.exp(-(math.multiply(wtTransp, mXq))));
        s = math.add(s, math.multiply(math.matrix(X[q]), y[q] - f));
      }

      s = math.multiply(s, 0.1); // Alpha
      var newWt = math.add(wt, s);

      var f = 1 / (1 + Math.exp(-(math.multiply(wtTransp, math.matrix(X[18])))));
      console.log(math.norm(math.subtract(newWt, wt)) + ' - ' + f);

      wt = newWt;
    }

  };

  reader.readAsText(file);
};

document.getElementById('file2').onchange = function() {

  var file = this.files[0];

  var globalCounter = {};
  var answersAndFeatures = [];

  var reader = new FileReader();
  reader.onload = function(progressEvent) {

    var lines = this.result.split('\n');
    for (var line = 0; line < lines.length; line++) {

      var words = lines[line].trim().split(/\s+/g);

      var tf = {};
      for (var w = 1; w < words.length; w++) {
        var word = words[w];

        if (!(globalCounter[word] instanceof Set)) {
          globalCounter[word] = new Set();
          //positionMap[word] = positionCounter++;
        }
        globalCounter[word].add(line);

        tf[word] = isNaN(tf[word]) ? 1 : tf[word] + 1;
      }

      for (var t in tf) {
        if (tf.hasOwnProperty(t)) {
          tf[t] = tf[t] * 1.0 / (words.length - 1);
        }
      }

      answersAndFeatures[line] = [];
      answersAndFeatures[line][0] = words[0];
      answersAndFeatures[line][1] = tf;
    }
    console.log(globalCounter);

    for (var j = 0; j < answersAndFeatures.length; j++) {
      var tfIdf = answersAndFeatures[j][1];

      var res = [];
      for (var q = 0; q < positionCounter; q++) {
        res[q] = 0;
      }

      for (var tw in tfIdf) {
        if (tfIdf.hasOwnProperty(tw)) {
          var wordTfIdf = tfIdf[tw] * Math.log(lines.length * 1.0 / globalCounter[tw].size);
          var wordPosition = positionMap[tw];
          //console.log('COUNTER: ' + positionCounter);
          if (!(wordPosition == undefined)) {
            res[wordPosition] = wordTfIdf;
          }
        }
      }

      answersAndFeatures[j][1] = res;
    }

    var X = [];
    for (var j = 0; j < answersAndFeatures.length; j++) {
      X[j] = [];
      X[j][0] = 1;
      for (var q = 0; q < answersAndFeatures[j][1].length; q++) {
        X[j][q + 1] = answersAndFeatures[j][1][q];
      }
    }

    var wtTransp = math.transpose(wt);

    for (var r = 0; r <= 1; r += 0.1) {

      var tp = 0;
      var fn = 0;
      
      var fp = 0;
      var tn = 0;
      
      for (var q = 0; q < answersAndFeatures.length; q++) {
        var actual = (answersAndFeatures[q][0] == 'rec.autos') ? 1 : 0;
        var f = 1 / (1 + Math.exp(-(math.multiply(wtTransp, math.matrix(X[q])))));
        f = step(f, r);

        if (actual == 1 && f == 1) {
          tp++;
        }
        if (actual == 1 && f == 0) {
          fn++;
        }
        if (actual == 0 && f == 1) {
          fp++;
        }
        if (actual == 0 && f == 0) {
          tn++;
        }
        //console.log('Real: ' + actual + ' Estm: ' + f);
      }

      //console.log(tp);
      //console.log(fn);
      var tpr = (tp * 1.0 / (tp + fn + 0.0000000000001)) * 100;
      console.log("TPR: " + tpr);
      
      var fpr = (fp * 1.0 / (fp + tn + 0.0000000000001)) * 100;
      console.log("FPR: " + tpr);
      
      onLoad();
    }

  };
  reader.readAsText(file);
};