  var margin = {top: 50, bottom: 50, left: 50, right: 50}; 
  var TRANSITION = 600;
  var svg = d3.select("body").append("svg")
      .attr("width",800)
      .attr("height",600);
  var width = +svg.attr("width") - margin.left - margin.right,
      height = +svg.attr("height") - margin.top - margin.bottom;
 
  var t_final = 2.0,
      n_Sol = 49,
      dx_Sol = 20./(n_Sol-1);          
  var Ns ={
      "nPrev" : n_Sol,
      "n" : n_Sol
  };
  var initialCond = [],
      solutionFinal = [];

  var xScale = d3.scaleLinear()
      .range([+margin.left,width-margin.right])
      .domain([-10,10]);
  var yScale = d3.scaleLinear()
      .range([(+height-margin.bottom-100),margin.top])
      .domain([0,1]);
  var colorScale = d3.scaleLog()
      .domain([1E-3,0.2])
      .range(["green","red"])
      .clamp(true);
  var xAxis = d3.axisBottom(xScale),
      yAxis = d3.axisLeft(yScale);

  var yAxisGroup = svg.append("g")
      .attr("class","yaxis")
      .attr("transform","translate("+(width/2+margin.left)+",0)")//Shift right
      .call(yAxis);
  var xAxisGroup = svg.append("g")
      .attr("class","xaxis")
      .attr("transform","translate("+margin.left+"," + (height-margin.bottom-100) +
          ")")//Shift down
      .call(xAxis);

  //Build Initial Condition and Solution
  for(var i=0; i<n_Sol;i++){
    var x = -10. +dx_Sol*i;
    var yI = Solution(x,0);
    var yF = Solution(x,t_final);
    var tupleI = {
      "x":x,
      "y":yI
    };
    var tupleF = {
      "x":x,
      "y":yF
    };
    initialCond.push(tupleI);
    solutionFinal.push(tupleF);
  }
  console.log(solutionFinal[0].y); 

  var lineFormat = d3.line()
  .x(function(d){return xScale(d.x)})
  .y(function(d){return yScale(d.y)})
      .curve(d3.curveMonotoneX);
  //Plot IC and FS
  var IC = svg.append("path")
      .attr("class","Initial Condition")
      .attr("d",lineFormat(initialCond))
      .attr("stroke","black")
      .attr("stroke-width",3)
      .attr("fill","none")
      .attr("transform","translate("+(margin.left)+",0)");//Shift right
  var FS = svg.append("path")
      .attr("class","Exact Solution")
      .attr("d",lineFormat(solutionFinal))
      .attr("stroke","green")
      .attr("stroke-width",3)
      .attr("fill","none")
      .attr("transform","translate("+(margin.left)+",0)");//Shift right
  var curSol = svg.append("path")
      .attr("class","CurrentSolution")
      .attr("d",lineFormat(initialCond))
      .attr("stroke","blue")
      .attr("stroke-width",3)
      .attr("fill","none")
      .attr("transform","translate("+(margin.left)+",0)");//Shift right
  var curSolR = svg.append("path")
      .attr("class","CurrentSolutionR")
      .attr("d",lineFormat(initialCond))
      .attr("stroke","red")
      .attr("stroke-width",3)
      .attr("fill","none")
      .attr("transform","translate("+(margin.left)+",0)");//Shift right

//Draw points for current solution (FE)
  svg.append("g")
      .attr("class","points")
      .selectAll(".point")
      .data(initialCond)
      .enter()
      .append("circle")
        .attr("class","point")
        .attr("r","4px")
        .attr("cx",function(d){return xScale(d.x)+margin.left})
        .attr("cy",function(d){return yScale(d.y)});
//Draw points for current solution (BE)
//  Draw black borders first
  svg.append("g")
      .attr("class","pointsR")
      .selectAll(".pointRB")
      .data(initialCond)
      .enter()
      .append("circle")
        .attr("class","pointRB")
        .attr("r","5px")
        .attr("cx",function(d){return xScale(d.x)+margin.left})
        .attr("cy",function(d){return yScale(d.y)});
  //Draw actual points now
  svg.select(".pointsR")
      .selectAll(".pointR")
      .data(initialCond)
      .enter()
      .append("circle")
        .attr("class","pointR")
        .attr("r","4px")
        .attr("cx",function(d){return xScale(d.x)+margin.left})
        .attr("cy",function(d){return yScale(d.y)});

//Draw Legend
  
      
//DT SLIDER
  var dt_min = 1E-3,
      dt_max = 1.0,
      dtFormat = d3.format(".1e");
  var sliderScale = d3.scaleLog()
      .domain([dt_min,dt_max])
      .range([margin.left, width-margin.right])
      .clamp(true);
  var dtColorScale = d3.scaleLog()
      .domain([dt_min,dt_max])
      .range(["green","red"])
      .clamp(true);
  var dtSlider = svg.append("g")
      .attr("class","slider")
      .attr("transform","translate("+margin.left+","+(height-margin.bottom)+")");

  dtSlider.append("line")
      .attr("class","track")
      .attr("x1",sliderScale.range()[0])
      .attr("x2",sliderScale.range()[1])
    .select(function() {return this.parentNode.appendChild(this.cloneNode(true));})
      .attr("class","track-inset")
    .select(function(){return this.parentNode.appendChild(this.cloneNode(true));})
      .attr("class","track-overlay")
      .call(d3.drag()
          .on("start.interrupt",function(){dtSlider.interrupt()})
          .on("start drag", function()
            {dtSliding(sliderScale.invert(d3.event.x))})
          .on("end",
              function(){calculateFE()}));

  dtSlider.insert("g",".track-overlay")
      .attr("class","ticks")
      .attr("transform","translate(0,"+18+")")
    .selectAll("text")
    .data(sliderScale.ticks(3))
    .enter().append("text")
      .attr("x",sliderScale)
      .attr("text-anchor","middle")
      .text(function(d) {return dtFormat(d);});

  var dtHandle = dtSlider.insert("circle",".track-overlay")
      .attr("class","dtHandle")
      .attr("cx",margin.left)
      .attr("r",8);
  var dtHandleLabel = dtSlider.insert("g",".track-overlay")
      .attr("class","dtHandleLabel")

  var pos = d3.selectAll(".dtHandle").attr("cx");
  dtHandleLabel.append("text")
      .attr("class","dtText")
      .attr("x",+pos-16)
      .attr("y", -10)
      .text(dtFormat(sliderScale.invert(pos)));
  dtHandleLabel.append("text")
      .attr("x",-40)
      .attr("y",3)
      .attr("font-size","12px")
      .style("font-weight","bold")
      .text("Timestep Size:");
//DX slider
  var nMax = 120,
      nMin = 10,
      dxFormat = d3.format("d");
  var dxSliderScale = d3.scaleLinear()
      .domain([nMin,nMax])
      .range([margin.left, width-margin.right])
      .clamp(true);

  var dxSlider = svg.append("g")
      .attr("class","dxSlider")
      .attr("transform","translate("+margin.left+","+(height-margin.bottom-60)+")");

  dxSlider.append("line")
      .attr("class","track")
      .attr("x1",dxSliderScale.range()[0])
      .attr("x2",dxSliderScale.range()[1])
    .select(function() {return this.parentNode.appendChild(this.cloneNode(true));})
      .attr("class","track-inset")
    .select(function(){return this.parentNode.appendChild(this.cloneNode(true));})
      .attr("class","track-overlay")
      .call(d3.drag()
          .on("start.interrupt",function(){dxSlider.interrupt()})
          .on("start drag", function()
            {dxSliding(dxSliderScale.invert(d3.event.x))})
          .on("end",
              function(){updateDX(dxSliderScale.invert(d3.event.x))}));

  dxSlider.insert("g",".track-overlay")
      .attr("class","ticks")
      .attr("transform","translate(0,"+18+")")
    .selectAll("text")
    .data(dxSliderScale.ticks(11))
    .enter().append("text")
      .attr("x",dxSliderScale)
      .attr("text-anchor","middle")
      .text(function(d) {return dxFormat(d);});

  var dxHandle = dxSlider.insert("circle",".track-overlay")
      .attr("class","dxHandle")
      .attr("cx",margin.left)
      .attr("r",8);
  var dxHandleLabel = dxSlider.insert("g",".track-overlay")
      .attr("class","dxHandleLabel")

  var dxpos = d3.selectAll(".dxHandle").attr("cx");
  dxHandleLabel.append("text")
      .attr("class","dxText")
      .attr("x",+dxpos-8)
      .attr("y", -10)
      .text(dxFormat(dxSliderScale.invert(dxpos)));
  dxHandleLabel.append("text")
      .attr("x",-40)
      .attr("y",3)
      .attr("font-size","10px")
      .style("font-weight","bold")
      .text("Number of Points:");
  //Add text labels to plot
  var stabCond = svg.append("text")
      .attr("class","stabCond")
      .attr("transform","translate("+(width-margin.right-120)+","+(margin.top
              +20)+")")
      .text("Stability Condition: 0");

    
  //Build LogLog Plot of Error

  var plotSvg = d3.select("body").append("svg")
      .attr("width",600)
      .attr("height",600)
      .attr("class","ErrorPlot");
  var width = +plotSvg.attr("width") - margin.left - margin.right,
      height = +plotSvg.attr("height") - margin.top - margin.bottom;
  var xLogScale = d3.scaleLog()
      .range([+margin.left,width-margin.right])
      //.domain([20./(nMax-1),20./(nMin-1)]);
      .domain([1E-4,1]);
  var yLogScale = d3.scaleLog()
      .range([(+height-margin.bottom-100),margin.top])
      .domain([1E-4,1]);
  var xLAxis = d3.axisBottom(xLogScale),
      yLAxis = d3.axisLeft(yLogScale);
  var yLAxisGroup = plotSvg.append("g")
      .attr("class","yLaxis")
      .attr("transform","translate("+2*+margin.left+",0)")
      .call(yLAxis);
  var xLAxisGroup = plotSvg.append("g")
      .attr("class","xLaxis")
      .attr("transform","translate("+margin.left+"," + (height-margin.bottom-100) +
          ")")//Shift down
      .call(xLAxis);
  //Create group for error points
  plotSvg.append("g").attr("class","ErrorFE");
  plotSvg.append("g").attr("class","ErrorBE");

//Plotting function
  function errorPlot(id,error,dt,dx){
    //ID: 0 for FE and 1 for BE
    if(id){
      //BE point plot
      console.log(id,error,dt,dx);
      plotSvg.select(".ErrorBE")
          .append("circle")
            .attr("class","ErrorBEPoint")
            .attr("r","5px")
            .attr("cx",xLogScale(dx)+margin.left)
            .attr("cy",yLogScale(error));
      plotSvg.select(".ErrorBE")
          .append("circle")
            .attr("class","ErrorBEPoint")
            .attr("r","4px")
            .attr("cx",xLogScale(dx)+margin.left)
            .attr("cy",yLogScale(error))
            .style("fill",dtColorScale(dt));
    }  
    else{
      plotSvg.select(".ErrorFE")
          .append("circle")
            .attr("class","ErrorFEPoint")
            .attr("r","5px")
            .attr("cx",xLogScale(dx)+margin.left)
            .attr("cy",yLogScale(error))
            .style("fill",dtColorScale(dt));
    }
  }
  

  function dtSliding(h){
    dtHandle.attr("cx",sliderScale(h));
    d3.selectAll(".dtText")
      .attr("x",sliderScale(h)-16)
      .text(dtFormat(h));
    calculateFE(); 

  }
  function dxSliding(h){
    dxHandle.attr("cx",dxSliderScale(h));
    d3.selectAll(".dxText")
      .attr("x",dxSliderScale(h)-8)
      .text(dxFormat(h));
  

  }

  
  function updateDX(h){
    //Passed N value from slider(float)
    var holder = Ns.n;
    var roundedN = Math.round(h);
    Ns.nPrev = holder;
    Ns.n = roundedN;
    //Round Slider Value to Nearest Int (Snap)
    dxHandle.attr("cx",dxSliderScale(roundedN));
    calculateFE();
  }

  function calculateFE(){
    //Clear current function
    var dt = sliderScale.invert(d3.selectAll(".dtHandle").attr("cx"));
    var N =
      Math.round(dxSliderScale.invert(d3.selectAll(".dxHandle").attr("cx")));
    var dx = 20./(N-1);
    var constant = dt/dx/dx;
    var sol = [];
    for(var i=0; i<N; i++){ 
      var x = -10. + dx*i;
      var y = Solution(x,0);
      var tuple = {
        "x":x,
        "y":y
      };
      sol.push(tuple);
    }
    var steps = parseInt(t_final/dt);
    var time = 0.0;
    //recalculate curSol
    for(var j =0; j<steps; j++){
      var solP = sol.slice();
      //Full FE step 
      for(var i=1;i<N-1;i++){
        sol[i].y= solP[i].y- constant*(2*solP[i].y-solP[i-1].y-solP[i+1].y);
      }
      time += dt;
    }
    var tDiff = t_final - time;
    solP = sol.slice();
    for(var i=1;i<N-1;i++){
      sol[i].y= solP[i].y- tDiff/dx/dx*(2*solP[i].y-solP[i-1].y-solP[i+1].y);
    }
    time += tDiff;
    //Calculate max Error
    var maxFEerr = 0;
    if(constant<1){
      for(var i=1; i<N;i++){
        var curErr = Math.abs(sol[i].y-Solution(sol[i].x,2.0));
        if(curErr > maxFEerr){
          maxFEerr=curErr;
        }
      }
      errorPlot(0,maxFEerr,dt,dx);
    }
    //Update Points
    time = 4*dt/dx/dx;
    d3.selectAll(".time")
      .text("Time: "+time+"s");
    curSol.attr("d",lineFormat(sol));
    var points = svg.select(".points").selectAll(".point")
        .data(sol);
    points.exit().remove();
    points.enter() 
        .append("circle")
        .attr("class","point") 
        .attr("r",0);
    svg.select(".points").selectAll(".point").data(sol)
        .attr("r", "9px")
        .attr("cx",function(d){return xScale(d.x)+margin.left})
        .attr("cy",function(d){return yScale(d.y)})
        .style("fill",function(d){return colorScale(Math.abs(d.y-Solution(d.x,2.0)))});
    
    calculateBE();
  }

  function calculateBE(){
    //Clear current function
    var dt = sliderScale.invert(d3.selectAll(".dtHandle").attr("cx"));
    var N =
      Math.round(dxSliderScale.invert(d3.selectAll(".dxHandle").attr("cx")));
    var dx = 20./(N-1);
    var constant = dt/dx/dx;
    var constBE = 2 + dx*dx/dt;
    var solR =[];
    for(var i=0; i<N; i++){ 
      var x = -10. + dx*i;
      var y = Solution(x,0);
      var tuple = {
        "x":x,
        "y":y
      };
      solR.push(tuple);
    }
    var steps = parseInt(t_final/dt);
    var time = 0.0;
    //Algorithm:
    //Gauss-Seidel Method
    var b = solR.slice(); 
    for(var i=0; i<steps ; i++){
      var up = solR.slice();
      var b = solR.slice();
      var delta = 5;
      var count = 0;
      while(delta > 1E-6){
        delta=0;
        count+=1;
        for(var k=1; k<N-1 ; k++){
          solR[k].y = 1./constBE*(b[k].y/constant+solR[k-1].y+up[k+1].y);
          delta += Math.abs(solR[k].y-up[k].y);
        }
        up = solR.slice();
        //if(count >5){break;}
      }
      time += dt;
    }
    //Have to step for final time that's leftover from timestep size
    var tDiff = t_final - time;
    var delta = 5;
    var b = solR.slice();
    var constBE = 2 + dx*dx/tDiff;
    var up = solR.slice();
    var count = 0;
    if (tDiff > 1E-6){
      while(delta > 1E-6){
        delta=0;
        for(var k=1; k<N-1 ; k++){
          solR[k].y = 1./constBE*(dx*dx/tDiff*b[k].y+solR[k-1].y+up[k+1].y);
          delta += Math.abs(solR[k].y-up[k].y);
        }
        count += 1;
        up = solR.slice();
        if(count >5){break;}
      }
    }
    //Calculate Error
    var maxError=0;
    for(var i=0; i<N; i++){
      curError = Math.abs(solR[i].y-Solution(solR[i].x,2.0));
      if(curError > maxError){
        maxError = curError;
      }
    }
    //Plot error point
    
    //Update Path Data
    curSolR.attr("d",lineFormat(solR));
    var stabilityCond = dt/dx/dx;
    d3.selectAll(".stabCond")
      .text("Stability Condition: "+stabilityCond.toPrecision(3));
    //Draw black circles for outline first
    var boldCircles = svg.select(".pointsR").selectAll(".pointRB")
        .data(solR);
    boldCircles.exit().remove();
    boldCircles.enter()
        .append("circle")
          .attr("class","pointRB")
          .attr("r","5px");
    svg.select(".pointsR").selectAll(".pointRB").data(solR)
          .attr("cx",function(d){return xScale(d.x)+margin.left})
          .attr("cy",function(d){return yScale(d.y)});
    //Redraw points with new solution
    var pointsR = svg.select(".pointsR").selectAll(".pointR")
        .data(solR);
    pointsR.exit().remove();
    pointsR.enter()
        .append("circle")
          .attr("class","pointR")
          .attr("r","5px");
    svg.select(".pointsR").selectAll(".pointR").data(solR)
          .attr("cx",function(d){return xScale(d.x)+margin.left})
          .attr("cy",function(d){return yScale(d.y)})
          .style("fill",function(d){return colorScale(Math.abs(d.y-Solution(d.x,2.0)))});
    //errorPlot(1,maxError,dt,dx);
  }

  function Solution(x,t){
    return 1./Math.pow(1.+4*t,0.5)*Math.exp(-x*x/(1+4*t));
  }
