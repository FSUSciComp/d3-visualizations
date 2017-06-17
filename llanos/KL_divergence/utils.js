function linspace(start, stop, numPoints){
    var delta = (stop - start)/(numPoints-1)
    var samples = []
    for (var i = 0; i < numPoints; i++){
      samples.push(start + i*delta); 
    }
    return samples;
  }

  function gaussianPDF(x, mean, std) {
    var gaussianConstant = 1 / Math.sqrt(2 * Math.PI);
    if (Array.isArray(x)){
      var numPoints = x.length;
      var pdf = [];
      for (var i = 0; i < numPoints; i++){
        var exponent = (x[i] - mean) / std;
        pdf.push(gaussianConstant * Math.exp(-.5 * exponent * exponent) / std); 
      }
      return pdf;
    } else {
      var exponent = (x - mean) / std;
      return gaussianConstant * Math.exp(-.5 * exponent * exponent) / std;
    }
  }

  function klDiv(p, q) {
    if (p.length != q.length) {
      // Arrays are not the same length!
      return 0;
    }

    var numPoints = p.length;
    var kl = 0;
    
    // normalize probability distributions
    pSum = d3.sum(p)
    qSum = d3.sum(q)
    for (var i = 0; i < numPoints; i++) {
        p[i] /= pSum;
        q[i] /= qSum;
    }
    // calculate kl divergence
    for (var i = 0; i < numPoints; i++) {
      kl = kl + p[i] * Math.log(p[i]/q[i])
    }
    return kl;
  }
  
  function sumArrays(a, b) {
    
    if (a.length != b.length) {
      return 0;
    }

    var numPoints = a.length;
    var sum = [];
    for (var i = 0; i < numPoints; i++) {
      sum.push(a[i] + b[i]);
    }
    return sum;
  }
