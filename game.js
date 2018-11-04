/*  Copyright (C)  2009  Thomas S. Visit: http://www.codereleased.com/cssgameengine/
    Permission is granted to copy, distribute and/or modify this document
    under the terms of the GNU Free documentation License, Version 1.3
    or any later version published by the Free Software Foundation;
    with no Invariant Sections, no Front-Cover Texts, and no Back-Cover Texts.
    A copy of the license is included in the section entitled "GNU
    Free documentation License". */

 // 'AGExEngine システム' //98
var ENGINETIME={};
var OSTIME={};
  	ENGINETIME=window;
  	ENGINETIME.lock=false;
  	ENGINETIME.count=0;
  	ENGINETIME.countLocks=0;
  	ENGINETIME.distribution=1.25; // .25 is the slice of time from z perspective since gravity is 1, x=1, y=1 and animation causes "weight" and motion
  	ENGINETIME.alloc=0;
  	ENGINETIME.gravity=1; //constant
  	ENGINETIME.force=0; // max movement is force/gravity where force equals 0. the rate of falling is animation from z perspective and gravity.
    OSTIME.millisec=0; // operating speed per unit
var ENGINE={
		init:function(){
      Player.object="_Psylocke";
      Computer.object="_Juggernaut";
      ENGINE.setPlayers(Player.object,Computer.object);
      ENGINE.initGravity();
      Player.selectStage("_GRAPH");
      Player.setPlayerTag();
      Player.character(ENGINE.Characters[0]);
      Player.idle();
      Computer.setComputerTag();
      Computer.character(ENGINE.Characters[1]);
      Computer.ai();
      Computer.setStageTag();
      ThreadManager.inputScanner()
		},
    initGravity:function(){
      Player.weight=eval(Player.object+"._PROFILE[0]._GRAVITY");
      Computer.weight=eval(Computer.object+"._PROFILE[0]._GRAVITY");
      ENGINETIME.gravity=(Player.weight==Computer.weight)?1:0;
      if(ENGINETIME.gravity==0){
        alert("error: Gravity must have a value of 1 int")
      }
    },
		instance:function(B){ // player 2 broadcast
      var A=0;
      var yP1=parseInt(Player.xCoordinate);
      var yP2=parseInt(Computer.xCoordinate);
      // HitBoxObj.Psylocke[0]._P1;
			if(B==ENGINE.Characters[1]){ // computer broadcast
				A=yP1+100 // this increases computer's range "hitbox"
			}else{
        // player broadcast
				if(B==ENGINE.Characters[0]){ // player broadcast
					A=yP1+100 //this increases player's range "hitbox"
				}
			}
			if(A>yP2){
				if(B==ENGINE.Characters[1]){
					if(Player.block==false){ // player is damaged.
						Player.superclassDamage()
					}else{
						Player.pushed(); // player blocks.
						ThreadManager.end("animationTimer2");
						Computer.superclassLocked()
					}
				}else{
					if(B==ENGINE.Characters[0]){ //280 //180
						if(Player.block==false){ // computer is damaged.
							Computer.superclassDamage()
						}
					}
				}
			}
		},
		setPlayers:function(B,A){
      A=eval(A+"._PROFILE[0]._ID");
      B=eval(B+"._PROFILE[0]._ID");
			ENGINE.Characters[0]=B;
			ENGINE.Characters[1]=A
		},
    setStage:function(A){
			ENGINE.Stage[0]=A
		},
		Characters:["Hiro","THIS"],
    Stage:["AGExEngine システム"]
};
var LoadImages={
}
var HitBoxObj={ // HitBoxObj.code[0]._x
    "Psylocke":[
      {
        "_P1":50,
        "_P3":100,
        "_P1P3":"Player.superclassPunch1();Player.superclassPunch3();",
        "_K1":"Player.superclassKick1();",
        "_K3":"Player.superclassKick3();",
        "_x":"x"
      }
    ],
    "Juggernaut":[
      {
        "_P1":100,
        "_P3":180,
        "_x":"x"
      }
    ]
}
var CharObj={ // CharObj.code[0]._x
    "code":[
      {
        "_103":"P1",
        "_106":"P3",
        "_103106":"P1P3",
        "_98":"K1",
        "_109":"K3",
        "_97110":"MOVENOTX_K2",
        "_97":"MOVENOTX",
        "_100":"MOVEX",
        "_119":"MOVEY",
        "_101":"MOVEYANDX",
        "_113":"MOVEYNOTX",
        "_122":"B1",
        "_x":"x"
      },
      {
        "_P1":"Player.superclassPunch1();",
        "_P3":"Player.superclassPunch3();",
        "_P1P3":"Player.superclassPunch1();Player.superclassPunch3();",
        "_K1":"Player.superclassKick1();",
        "_K3":"Player.superclassKick3();",
        "_MOVENOTX_K2":"Player.superclassKick2();",
        "_MOVENOTX":"Player.superclassMoveNotX();",
        "_MOVEX":"Player.superclassMoveX();",
        "_MOVEY":"Player.superclassMoveY();",
        "_MOVEYANDX":"Player.superclassMoveYandX();",
        "_MOVEYNOTX":"Player.superclassMoveYnotX();",
        "_B1":"Player.superclassBlock();",
        "_x":"x"
      }
    ]
}
var InputMap={
    correspondence:function(A){
      var validation=false;
      if(eval("CharObj.code[0]._"+A)){
        validation=true;
      }
      if(validation==true){
        var B=eval("CharObj.code[0]._"+A);
        var C=eval("CharObj.code[1]._"+B);
        eval(C);
      }
    }
}
var ThreadManager={
		list:[],
		listLock:[],
    listNotFrames:[],
    listHitFrames:[],
    listInputA:[],
    listInputB:[],
    scannerInterval:200,
    inputScanner:function(){ // if there is a valid chain of input such as "combos," then terminate the thread and add a fresh new interal.
      this.removeInputUserAll();
      ThreadManager.end("inputScanner");
      ThreadManager.start("inputScanner","ThreadManager.inputScanner();",this.scannerInterval)
    },
    inputScannerReset:function(){ // if there is a valid chain of input such as "combos," then terminate the thread and add a fresh new interal.
      ThreadManager.end("inputScanner");
      ThreadManager.start("inputScanner","ThreadManager.inputScanner();",this.scannerInterval)
    },
    inputUser:function(){
      document.getElementById("inputLog").innerHTML=this.getInputUserStr();
      InputMap.correspondence(this.getInputUserStr());
    },
    counterInputUser:function(){
			return this.listInputA.length;
		},
    addInputUser:function(B){
      this.inputScannerReset();
      this.listInputA.push(B);
      this.inputUser();
		},
    removeInputUserAll:function(){
			if(this.listInputA.length>0){
        for(i=0;i<this.listInputA.length;i++){
					this.listInputA.splice(i,1)
				}
			}
		},
    removeInputUser:function(A){
      var A=A.toString();alert(A);
			if(this.listInputA.length>0){
				for(i=0;i<this.listInputA.length;i++){
					if(this.listInputA[i]==A){
						this.listInputA.splice(i,1)
					}
				}
			}
		},
    getInputUserStr:function(){
      var A="";
			for(i=0;i<this.listInputA.length;i++){
				A+=this.listInputA[i]+""
			}
			return A
    },
		allocReset:function(A){
			ENGINETIME.alloc=A;
		},
		allocSet:function(){
			ENGINETIME.distribution=1.25;
			ENGINETIME.alloc=0;
		},
		allocState(){
      ThreadøallocState.push();
			ENGINETIME.distribution=(ENGINETIME.alloc>0)?ENGINETIME.alloc:ENGINETIME.distribution;
		},
		start:function(singlethread,code,millisec){
			eval("ENGINETIME."+singlethread+" = setTimeout('"+code+"',"+millisec+");"); // animation time squared subset of 1 thread count.
			this.add(singlethread);
			this.counter()
		},
		end:function(singlethread){
			eval("clearTimeout(ENGINETIME."+singlethread+");");
			this.remove(singlethread);
			this.counter()
		},
    // list
		counter:function(){
			ENGINETIME.count=this.list.length;
			ENGINETIME.document.getElementById("thread_count").innerHTML=ENGINETIME.count;
			ENGINETIME.document.getElementById("thread_ids").innerHTML=this.listId()
		},
		add:function(B){
			var A=false;
			for(i=0;i<this.list.length;i++){
				if(this.list[i]==B){
					A=true
				}
			}
			if(A==false){
				this.list[i]=B
			}
		},
		remove:function(A){
			if(this.list.length>0){
				for(i=0;i<this.list.length;i++){
					if(this.list[i]==A){
						this.list.splice(i,1)
					}
				}
			}
		},
		listId:function(){
      return this.list.join("<br />")
		},
    find:function(B){
			var A=false;
			for(i=0;i<this.list.length;i++){
				if(this.list[i]==B){
					A=true
				}
			}
			return A;
		},
    // listLocks
		counterLock:function(){
			ENGINETIME.countLocks=this.listLock.length;
			ENGINETIME.document.getElementById("thread_count_lock").innerHTML=ENGINETIME.countLocks;
			ENGINETIME.document.getElementById("thread_ids_lock").innerHTML=this.listIdLock()
		},
		addLock:function(B){
			var A=false;
			for(i=0;i<this.listLock.length;i++){
				if(this.listLock[i]==B){
					A=true
				}
			}
			if(A==false){
				this.listLock[i]=B
			}
		},
		removeLock:function(){
			if(this.listLock.length>0){
				for(i=0;i<this.listLock.length;i++){
						this.listLock.splice(i,1)
				}
			}
		},
		listIdLock:function(){
      return this.listLock.join("<br />")
		},
    // notFrames
    counterNotFrames:function(){
			ENGINETIME.countLocks=this.listNotFrames.length;
		},
		addNotFrames:function(B){
			var A=false;
			for(i=0;i<this.listNotFrames.length;i++){
				if(this.listNotFrames[i]==B){
					A=true
				}
			}
			if(A==false){
        this.listNotFrames[i]=B
			}
		},
		removeNotFramesAll:function(isCharacter){
      var a;
			if(this.listNotFrames.length>0){
				for(i=0;i<this.listNotFrames.length;i++){
          a=this.listNotFrames[i].split(":");
          if(a[0]==isCharacter){
						this.listNotFrames.splice(i,1);
            // i=0 // 2 or more threads share this list splice changes the other's iteration, so restart the count from 0 each time a match exists.
          }
				}
			}
		},
		listIdNotFrames:function(){
      return ThreadManager.listNotFrames.join(",")
		},
    // hitFrames
    counterHitFrames:function(){
			ENGINETIME.countHitFrames=this.listHitFrames.length;
		},
		addHitFrames:function(B){
			var A=false;
			for(i=0;i<this.listHitFrames.length;i++){
				if(this.listHitFrames[i]==B){
					A=true
				}
			}
			if(A==false){
				this.listHitFrames[i]=B
			}
		},
		removeHitFramesAll:function(isCharacter){
      var a;
			if(this.listHitFrames.length>0){
				for(i=0;i<this.listHitFrames.length;i++){
          a=this.listHitFrames[i].split(":");
          if(a[0]==isCharacter){
						this.listHitFrames.splice(i,1)
            i=0 // 2 or more threads share this list splice changes the other's iteration, so restart the count from 0 each time a match exists.
          }
				}
			}
		},
		listIdHitFrames:function(){
			var A="";
			for(i=0;i<this.listHitFrames.length;i++){
				A+=this.listHitFrames[i]
			}
			return A
		}
};
var VariableTiming={
    do:"",
    wait:function(singlethread,code,qSide){
      if(this.isSide!=qSide){
        ThreadManager.end(singlethread);
        ThreadManager.start(singlethread,code,ENGINETIME.force);
      }
    },
    syntaxNotFrames:function(){
      var id=eval(this.object+"._PROFILE[0]._ID");
      var notFrames=eval(this.object+"."+this.do+"[0]._NOTFRAMES").split(",");
      for(i=0;i<notFrames.length;i++){
				notFrames[i]=id+":"+notFrames[i]
			}
      return notFrames.join(",")
    },
    syntaxHitFrames:function(){
      var id=eval(this.object+"._PROFILE[0]._ID");
      var hitFrames=eval(this.object+"."+this.do+"[0]._HITFRAMES").split(",");
      for(i=0;i<hitFrames.length;i++){
				hitFrames[i]=id+":"+hitFrames[i]
			}
      return hitFrames.join(",")
    },
    object:"",
    isSide:null,
    isArray:function(A){
      return (A[0])?A.length:0;
    },
    isNotFrames:function(A,isCharacter){
      var B=ThreadManager.listIdNotFrames().split(",");
      var a=false;
      var n=[];
      if(VariableTiming.isArray(B)){
        for(i=0;i<B.length;i++){
          n=B[i].split(":");
          if(VariableTiming.isArray(n)){
            if(n[0]==isCharacter){
              if(A==parseInt(n[1])){
                a=isCharacter
              }
            }
          }
        }
      }
      return a
    },
    isNotFramesExplode:function(A,isCharacter){
      var B=ThreadManager.listIdNotFrames().split(",");
      var a=false;
      var n=[];
      var k=[];
      if(VariableTiming.isArray(B)){
        for(i=0;i<B.length;i++){
          k.push(B[i]);
          n=B[i].split(":");
          if(VariableTiming.isArray(n)){
            if(n[0]==isCharacter){
              if(A==parseInt(n[1])){
                k.splice(i,1)
              }
            }
          }
        }
      }
      ThreadManager.listNotFrames=k
    },
    isNotFramesMax:function(A,isCharacter){
      var B=ThreadManager.listIdNotFrames().split(",");
      var a=0;
      var n=[];
      var k=0;
      if(VariableTiming.isArray(B)){
        for(i=0;i<B.length;i++){
          n=B[i].split(":");
          if(VariableTiming.isArray(n)){
            if(n[0]==isCharacter){
              k=k+1
            }
          }
        }
      }
      a=A-k;
      return a
    },
    isHitFrames:function(A,isCharacter){
      var B=ThreadManager.listIdHitFrames().split(",");
      var a=false;
      var n=[];
      if(VariableTiming.isArray(B)){
        for(i=0;i<B.length;i++){
          n=B[i].split(":");
          if(VariableTiming.isArray(n)){
            if(n[0]==isCharacter){
              if(A==parseInt(n[1])){
                a=isCharacter;
              }
            }
          }
        }
      }
      return a
    },
    isHitFramesExplode:function(A,isCharacter){
      var B=ThreadManager.listIdHitFrames().split(",");
      var a=false;
      var n=[];
      var k=[];
      if(VariableTiming.isArray(B)){
        for(i=0;i<B.length;i++){
          k.push(B[i]);
          n=B[i].split(":");
          if(VariableTiming.isArray(n)){
            if(n[0]==isCharacter){
              if(A==parseInt(n[1])){
                k.splice(i,1);
              }
            }
          }
        }
      }
      ThreadManager.listHitFrames=k
    },
    initSpeedZ:function(c){
      this.area=(1.33*c)+0.1; // xy check. 0.01 to influence rounding up.
      Player.fps=c+Player.area; // xy animation in 3 dimension, the animation time itself is a dimension so this adds 3 of the same things cubed.
      ENGINETIME.force=Math.round(Player.fps); // direction squared.
      ENGINETIME.force=ENGINETIME.force-(Player.area/ENGINETIME.gravity); // it is to "crowd out" gravity from animation.
      Player.displacement=Math.round(ENGINETIME.force/4) // this is the quadrant for whatever quarter.
    },
    initSpeed:function(c,C){
      this.area=(1.33*c)+0.1;
      C.fps=c+C.area;
      ENGINETIME.force=Math.round(C.fps);
      ENGINETIME.force=ENGINETIME.force-(C.area/ENGINETIME.gravity);
      C.displacement=Math.round(ENGINETIME.force/4);
      return C;
    },
    syncFrames:function(a){
      var A=ENGINETIME.document.getElementById(Player.isCharacter).style;
      A=SettingsCSS.apply(A,eval(Player.object+"."+a+"[0]"),Player.isCharacter);
      Player.maxLoop=eval(Player.object+"."+a+"[0]._MAX");
			Player.eachFrameWidth=eval(Player.object+"."+a+"[0]._EACHxPIXELS");
      Player.frame=0;
      Player.loop=1
    },
    syncFramesC:function(c,C){
      C.frame=0;
      C.loop=(c==null)?1:c;
      return C
    },
    variableFrameOfReference:function(C){
      var sync=(Player.loop==C.loop)?true:false; // 1 to 1 corresponds, acts as a "valve" or "retard" the timing.
      if(!sync){
        C.loop=C.loop+1;
      }
      return C
    },
    statics:function(){ // handles all statics
      //alert(Player.state);
      //alert(Player.state);
      //if(Player.state=="_IDLE"){
        Player.statics(); // force on ground
        // VariableTiming.wait("animationTimer1","Player.animation();",this.isSide)
      //}
      if(Computer.state=="_IDLE"){
        //Computer.statics(); // force on ground
      }
      // if(Computer.state=="_SUPERMOVE"){
      //   wait("animationTimer1","Player.animation();",this.isSide)
      // }
    },
    moveZ:function(){ // invoke VariableTiming so C is an object of VT relative to user's frame, within VT's this* scope the velocity is 0.
      var A=ENGINETIME.document.getElementById(Computer.pTag).style;
      var C=ENGINETIME.document.getElementById(Computer.sTag).style;
      if(C.loop<C.maxLoop){
        C.frame=C.frame+C.eachFrameWidth;
        C=VariableTiming.variableFrameOfReference(C);
        var inertia=VariableTiming.xYinertia(Player.weight);
        var up=(C.maxLoop-C.loop)+inertia;
        var down=C.loop+inertia;
        cY=Computer.yCoordinate;
        var cUp=parseInt(cY)+up;
        var cDown=parseInt(cY)+down;
        if(C.loop<Math.round(C.maxLoop/2)){ // loop the same frame so 0 offset y coordiante.
          A.top=cDown+"px";
          C.backgroundPosition="0px "+down+"px"; // animate -up
        }else{
          A.top=cUp+"px";
          C.backgroundPosition="0px "+up+"px"; // animate -down
        }
        ThreadManager.allocState();
        C.fps=Math.round(C.fps/ENGINETIME.distribution);
        if(Player.weight==0){ // exact point of free falling whatever the xy coordinates
          var iteration=(up/down==1)?true:false; // influenced by VariableTiming.variableFrameOfReference()
        }
        ThreadManager.end("gravityTimer");
        ThreadManager.start("gravityTimer","VariableTiming.moveZ();",C.fps);
        ThreadManager.allocSet()
      }else{
        ThreadManager.end("gravityTimer");
        A.top=cY+"px";
        C=Computer.statics(C) // statics
      }
    },
    // Subset of Array => ENGINE.isCharacter as a reference to object A denoted by x, y _origin function of A
    xOrigin:function(A){
      var onClip=false;
      var direction="";
      var increment="";
      ThreadManager.addLock("xOrigin()");
      ThreadManager.counterLock();
      Player.spamlock="xOrigin()";

      if(Player.xOrientation=="<"){
        direction="Player.xMoveByPixel < Player.xCoordinate"
      }else{
        if(Player.xOrientation=">"){
          direction="Player.xMoveByPixel > Player.xCoordinate"
        }
      }
      var A=ENGINETIME.document.getElementById(Player.pTag).style;
      if(eval(direction)){
        if(Player.xOrientation=="<"){
          if(Player.xCoordinate>0){ // exact point of not A and U universe intersect is false.
            increment="Player.xCoordinate -= 1;"
          }else{
            onClip=true;
          }
        }else{
          if(Player.xCoordinate<Computer.xCoordinate){ // exact point of A and U universe intersect is false.
            if(Player.xOrientation==">")
              increment="Player.xCoordinate += 1;"
          }
        }
        eval(increment);
        if(onClip==false){
          ENGINETIME.speed=ENGINETIME.gravity;
          A.left=Player.xCoordinate+"px";
          ThreadManager.end("xOriginTimer");
          ThreadManager.start("xOriginTimer","VariableTiming.xOrigin();",ENGINETIME.speed)
        }else{
          if(Player.air){
          }
          ThreadManager.end("xOriginTimer");
        }
      }else{
        ThreadManager.end("xOriginTimer")
      }
    },
    yOrXwhile:function(A){
      var direction="";
      if(A=="^"){
        direction="Player.yMoveByPixel < Player.yCoordinate"
      }else{
        if(A="V"){
          direction="Player.yMoveByPixel > Player.yCoordinate"
        }
      }
      return eval(direction);
    },
    yXcoordinate:function(A){
      var increment="";
      if(Player.yOrientation=="^"){
        increment="Player.yCoordinate -= 1;"
      }else{
        if(Player.yOrientation=="V"){
          increment="Player.yCoordinate += 1;"
        }
      }
      eval(increment);
    },
    xYinertia:function(A){ // xy inertia is a bijection of state function A
      return A; // static
    },
    yOriginUp:function(){
      ThreadManager.addLock("yOriginUp()");
      ThreadManager.counterLock();
      Player.spamlock="yOriginUp()";
      VariableTiming.yOrXwhile(Player.yOrientation);
      var A=ENGINETIME.document.getElementById(Player.pTag).style;
      if(VariableTiming.yOrXwhile(Player.yOrientation)){
        VariableTiming.yXcoordinate(Player.yCoordinate); // private
        ENGINETIME.speed=ENGINETIME.gravity;
        A.top=Player.yCoordinate+"px";
        ThreadManager.end("yOriginTimer");
        ThreadManager.start("yOriginTimer","VariableTiming.yOriginUp();",ENGINETIME.speed);
      }else{ // exact point of falling.
        // Player.weight=0; // force cancels weight. gravity is always at the opposite end, much faster than animation frames, not animation/time.
        ThreadManager.end("yOriginTimer");
        Player.yMoveByPixel=Player.yMoveByPixelOriginal;
        Player.yMoveByPixel=Player.yCoordinate+Player.yMoveByPixel;
        Player.yOrientation="V";
        VariableTiming.yOriginDown()
      }
    },
    yOriginDown:function(){
      ThreadManager.addLock("yOriginDown()");
      ThreadManager.counterLock();
      Player.spamlock="yOriginDown()";
      var A=ENGINETIME.document.getElementById(Player.pTag).style;
      if(VariableTiming.yOrXwhile(Player.yOrientation)){
        VariableTiming.yXcoordinate(Player.yCoordinate);
        ENGINETIME.speed=ENGINETIME.gravity;
        A.top=Player.yCoordinate+"px";
        ThreadManager.end("yOriginTimer");
        ThreadManager.start("yOriginTimer","VariableTiming.yOriginDown();",ENGINETIME.speed)
      }else{
        ThreadManager.end("yOriginTimer")
      }
    },
    // Subset of Array => ENGINE.isStage as a reference to object A deonted by Z_ _origin function of A
    zXorigin:function(){
      var direction="";
      var increment="";
      ThreadManager.addLock("zXorigin()");
      ThreadManager.counterLock();
      Player.spamlock="zXorigin()";
      var C=ENGINETIME.document.getElementById(Computer.sTag).style;
      if(C.xOrientation=="<"){
        direction="C.xMoveByPixel < C.xCoordinate"
      }else{
        if(C.xOrientation=">"){
          direction="C.xMoveByPixel > C.xCoordinate"
        }
      }
      if(eval(direction)){
        if(C.xOrientation=="<"){
          if(C.xCoordinate>0){ // exact point of not A and U universe intersect.
            increment="C.xCoordinate -= 1;"
          }
        }else{
          if(C.xOrientation==">"){
            increment="C.xCoordinate += 1;"
          }
        }
        eval(increment);
        ENGINETIME.speed=ENGINETIME.gravity;
        C.left=C.xCoordinate+"px";
        ThreadManager.end("zXoriginTimer");
        ThreadManager.start("zXoriginTimer","VariableTiming.zXorigin();",ENGINETIME.speed)
      }else{
        ThreadManager.end("zXoriginTimer")
      }
    },
    zYoriginUp:function(){
      ThreadManager.addLock("zYoriginUp()");
      ThreadManager.counterLock();
      Player.spamlock="zYoriginUp()";
      VariableTiming.yOrXwhileNotYoffset(C.yOrientation);
      var C=ENGINETIME.document.getElementById(Computer.sTag).style;
      if(VariableTiming.yOrXwhileNotYoffset(C.yOrientation)){
        VariableTiming.yXcoordinateOffset(C.yZcoordinate); // private
        ENGINETIME.speed=ENGINETIME.gravity;
        C.top=C.yZcoordinate+"px";
        ThreadManager.end("zYoriginTimer");
        ThreadManager.start("zYoriginTimer","VariableTiming.zYoriginUp();",ENGINETIME.speed)
      }else{
        ThreadManager.end("zYoriginTimer");
        C.yMoveByPixel=C.yMoveByPixelOriginal;
        C.yMoveByPixel=C.yZcoordinate+C.yMoveByPixel;
        C.yOrientation="V";
        VariableTiming.zYoriginDown()
      }
    },
    zYoriginDown:function(){
      ThreadManager.addLock("zYoriginDown()");
      ThreadManager.counterLock();
      Player.spamlock="zYoriginDown()";
      var C=ENGINETIME.document.getElementById(Computer.sTag).style;
      if(VariableTiming.yOrXwhileNotYoffset(C.yOrientation)){
        VariableTiming.yXcoordinateOffset(C.yZcoordinate);
        ENGINETIME.speed=ENGINETIME.gravity;
        C.top=C.yZcoordinate+"px";
        ThreadManager.end("zYoriginTimer");
        ThreadManager.start("zYoriginTimer","VariableTiming.zYoriginDown();",ENGINETIME.speed)
      }else{
        ThreadManager.end("zYoriginTimer")
      }
    },
    yOrXwhileNotYoffset:function(C){
      var direction="";
      if(A=="^"){
        direction="C.yMoveByPixel > C.yZcoordinate"
      }else{
        if(A="V"){
          direction="C.yMoveByPixel < C.yZcoordinate"
        }
      }
      return eval(direction);
    },
    yXcoordinateOffset:function(C){
      var increment="";
      if(C.yOrientation=="^"){
        increment="Player.yZcoordinate += 1;"
      }else{
        if(C.yOrientation=="V"){
          increment="Player.yZcoordinate -= 1;"
        }
      }
      eval(increment);
    },
    moveX:function(){
      VariableTiming.do="_MOVEX";
      Player.state=VariableTiming.do;
      Player.syncFramesTypeSettings();
      ThreadManager.counterNotFrames();
      ENGINETIME.lock=false;
      Player.getStateType();
      // Player.air=false;
      ThreadManager.addLock("moveX()");
      ThreadManager.counterLock();
      Player.spamlock="moveX()";
      VariableTiming.syncFrames("_MOVEX");
      Player.initSpeed(25);
      ThreadManager.allocReset(1.00);
      ThreadManager.end("animationTimer1");
      ThreadManager.start("animationTimer1","Player.animation();",ENGINETIME.force);
      Player.xMoveByPixel=2*Player.displacement;
      Player.xMoveByPixel=Player.xCoordinate+Player.xMoveByPixel;
      Player.xOrientation=">";
      VariableTiming.xOrigin()
    },
    moveNotX:function(){
      VariableTiming.do="_MOVENOTX";
      Player.state=VariableTiming.do;
      Player.syncFramesTypeSettings();
      ThreadManager.counterNotFrames();
      ENGINETIME.lock=false;
      Player.getStateType();
      // Player.air=false;
      ThreadManager.addLock("moveNotX()");
      ThreadManager.counterLock();
      Player.spamlock="moveNotX()";
      VariableTiming.syncFrames("_MOVENOTX");
      Player.initSpeed(25);
      ThreadManager.allocReset(1.00);
      ThreadManager.end("animationTimer1");
      ThreadManager.start("animationTimer1","Player.animation();",ENGINETIME.force);
      Player.xMoveByPixel=2*Player.displacement;
      Player.xMoveByPixel=Player.xCoordinate-Player.xMoveByPixel;
      Player.xOrientation="<";
      VariableTiming.xOrigin()
    },
    moveY:function(){
      VariableTiming.do="_MOVEY";
      Player.state=VariableTiming.do;
      Player.syncFramesTypeSettings();
      ThreadManager.counterNotFrames();
      ENGINETIME.lock=false;
      Player.getStateType();
      // Player.air=true;
      ThreadManager.addLock("moveY()");
      ThreadManager.counterLock();
      Player.spamlock="moveY()";
      VariableTiming.syncFrames("_MOVEY"); // x # of frames is the perspective z needed for space time.
      VariableTiming.initSpeedZ(100); // we expand the quarter into time fps, so it's a subet of timeslice and eval() it.
      ThreadManager.allocReset(1.00);
      ThreadManager.end("animationTimer1"); // distance corresponds to time. to retrieve space/time from perspective z.
      ThreadManager.start("animationTimer1","Player.animation();",ENGINETIME.force); // restart loop by pixels and is now a wave function.
      Player.xMoveByPixel=2*0;
      Player.yMoveByPixel=Player.displacement;
      Player.yMoveByPixelOriginal=Player.yMoveByPixel;
      Player.xMoveByPixel=Player.xCoordinate-Player.xMoveByPixel;
      Player.yMoveByPixel=Player.yCoordinate-Player.yMoveByPixel;
      Player.xOrientation="<";
      Player.yOrientation="^";
      VariableTiming.xOrigin();
      VariableTiming.yOriginUp()
    },
    moveYandX:function(){
      VariableTiming.do="_MOVEYANDX";
      Player.state=VariableTiming.do;
      Player.syncFramesTypeSettings();
      ThreadManager.counterNotFrames();
      ENGINETIME.lock=false;
      Player.getStateType();
      // Player.air=true;
      ThreadManager.addLock("moveYandX()");
      ThreadManager.counterLock();
      Player.spamlock="moveYandX()";
      VariableTiming.syncFrames("_MOVEYANDX");
      Player.initSpeed(50);
      ThreadManager.allocReset(1.00);
      ThreadManager.end("animationTimer1");
      ThreadManager.start("animationTimer1","Player.animation();",ENGINETIME.force);
      Player.xMoveByPixel=2*Player.displacement;
      Player.yMoveByPixel=Player.displacement;
      Player.yMoveByPixelOriginal=Player.yMoveByPixel;
      Player.xMoveByPixel=Player.xCoordinate+Player.xMoveByPixel;
      Player.yMoveByPixel=Player.yCoordinate-Player.yMoveByPixel;
      Player.xOrientation=">";
      Player.yOrientation="^";
      VariableTiming.xOrigin();
      VariableTiming.yOriginUp()
    },
    moveYnotX:function(){
      VariableTiming.do="_MOVEYNOTX";
      Player.state=VariableTiming.do;
      Player.syncFramesTypeSettings();
      ThreadManager.counterNotFrames();
      ENGINETIME.lock=false;
      Player.getStateType();
      // Player.air=true;
      ThreadManager.addLock("moveYnotX()");
      ThreadManager.counterLock();
      Player.spamlock="MOVEYNOTX()";
      VariableTiming.syncFrames("_MOVEYNOTX");
      Player.initSpeed(50);
      ThreadManager.allocReset(1.00);
      ThreadManager.end("animationTimer1");
      ThreadManager.start("animationTimer1","Player.animation();",ENGINETIME.force);
      Player.xMoveByPixel=2*Player.displacement;
      Player.yMoveByPixel=Player.displacement;
      Player.yMoveByPixelOriginal=Player.yMoveByPixel;
      Player.xMoveByPixel=Player.xCoordinate-Player.xMoveByPixel;
      Player.yMoveByPixel=Player.yCoordinate-Player.yMoveByPixel;
      Player.xOrientation="<";
      Player.yOrientation="^";
      VariableTiming.xOrigin();
      VariableTiming.yOriginUp()
    },
    moveYoffSet:function(y){ // this is good for injecting faster frame changes for Y. relative standpoint z perspective ::xyz::markup
      ENGINETIME.lock=false;
      // Player.getStateType();
      // Player.air=true;
      ThreadManager.addLock("moveYoffSet()");
      ThreadManager.counterLock();
      Player.spamlock="moveYoffSet()";
      var C=ENGINETIME.document.getElementById("Stage_Tag").style;
      C.width=Computer.widthZ+"px";
      C.height=Computer.heightz+"px";
      C.background=Computer.zImg(C);
      C.maxLoop=y.maxLoop;
      C.eachFrameWidth=y.eachFrameWidth;
      C=VariableTiming.syncFramesC(y.loop,C);
      C=VariableTiming.initSpeed(50,C);
      ThreadManager.allocReset(1.00); // we expand the quarter into time fps, so it's a subet of timeslice and eval() it.
      ThreadManager.end("gravityTimer");
      ThreadManager.start("gravityTimer","VariableTiming.moveZ();",ENGINETIME.force)
    }
}
var SettingsCSS={
    apply:function(A,a,isCharacter,isStage){
      var A;
      var y=60;
      A.width=a._WIDTH+"px";
      A.height=(a._HEIGHT+y)+"px";
      A.position=a._POSITION;
      A.zindex=a._ZINDEX;
      A.left=a._LEFT+"px";
      A.top=a._TOP+"px";
      if(isStage==null){
        A.background="url(./ENGINE/Sprites/Players/"+isCharacter+"/"+a._BACKGROUND+") no-repeat";
        A.backgroundSize=a._EACHxMAX+"px "+(a._HEIGHT+y)+"px"
      }else{
        A.background="url(./ENGINE/Sprites/Stage/"+a._BACKGROUND+") repeat"
      }
      A.backgroundPosition="0px 0px";
      return A
    }
}
var Player={
    object:"",
    state:"",
		pX:0,
		pY:0,
		pTag:"Player1_Tag",
		frame:0,
		loop:1,
		isCharacter:"",
		toCharacter:ENGINE.Characters[1],
    height:150, // static
    width:150, // static
		xCoordinate:50, // global
		yCoordinate:60, // global
    zXcoordinate:0,
		yZcoordinate:0,
    position:"absolute",
		lock:false,
		air:false,
		spamlock:"",
    weight:0,
    yOffSet:true,
    bubbleAx:true,
    bubbleAy:true,
    bubbleBx:true,
    bubbleBy:true,
    isSide:true,
		character:function(A){
			this.isCharacter=A
		},
		setPlayerTag:function(){
			var A=ENGINETIME.document.getElementById(this.pTag).style;
			A.left=this.xCoordinate+"px";
			A.top=this.yCoordinate+"px";
      A.position=this.position
		},
    selectStage(z){
      ENGINE.setStage(z);
      this.setStage()
    },
    setStage(){
      Computer.isStage=ENGINE.Stage[0]
    },
		unLockAll:function(){
			ThreadManager.removeLock();
			ThreadManager.counterLock()
		},
    statics:function(){
      VariableTiming.do="_STATICS";
      VariableTiming.syncFrames("_STATICS");
      this.syncFramesTypeSettings();
      this.state=VariableTiming.do;
      this.syncFramesTypeSettings();
			ENGINETIME.lock=true;
			// this.block=false;
			// this.air=false;
			ThreadManager.addLock("statics()");
			ThreadManager.counterLock();
			this.initSpeed(50);
			ThreadManager.end("animationTimer1");
			ThreadManager.start("animationTimer1","Player.animation();",ENGINETIME.force)
		},
    initSpeed:function(c){
      this.area=(1.33*c)+0.1; // c millisec quadrant displacement. 4/3=1.33 round 1.33x3=3.99+.01=~4, c is a variable, 0.01 to influence rounding up.
			this.fps=c+this.area; // areatime in 1 millisec power of negative 1.
			ENGINETIME.force=Math.round(this.fps);
			this.displacement=Math.round(ENGINETIME.force/4)
    },
    initFrames:function(){
      var A=ENGINETIME.document.getElementById(this.isCharacter).style;
      A=SettingsCSS.apply(A,eval(this.object+"."+this.state+"[0]"),this.isCharacter);
      if(this.isSide){
        this.maxLoop=parseInt(eval(this.object+"."+this.state+"[0]._MAX"));
  			this.eachFrameWidth=eval(this.object+"."+this.state+"[0]._EACHxPIXELS");
        this.frame=0;
        this.loop=1
      }else{
        this.loop=parseInt(eval(this.object+"."+this.state+"[0]._MAX"));
  			this.eachFrameWidth=eval(this.object+"."+this.state+"[0]._EACHxPIXELS");
        this.frame=parseInt(eval(this.object+"."+this.state+"[0]._EACHxMAX"))-this.eachFrameWidth;
        this.maxLoop=0;
        A.backgroundPosition=this.xYpixels() // before the animation starts, it's in the 0th iteration so load the last frame for 0
      }
    },
    getStateType:function(){
      var attack=eval(this.object+"."+this.state+"[0]._ATTACK");
      var block=eval(this.object+"."+this.state+"[0]._BLOCK");
      var air=eval(this.object+"."+this.state+"[0]._AIR");
      if(attack!=null){
        this.attack=attack
      }
      if(block!=null){
        this.block=block
      }
      if(air!=null){
        this.air=air
      }
    },
    syncFramesTypeSettings:function(){ // sync frames or missfiring happens.
      VariableTiming.object=this.object;
      var notFrames=VariableTiming.syntaxNotFrames().split(":");
      var hitFrames=VariableTiming.syntaxHitFrames().split(":");
      var numNotFrames=notFrames[1].split(",");
      var numHitFrames=hitFrames[1].split(",");
      if(parseInt(numNotFrames[0])>0){
        ThreadManager.addNotFrames(VariableTiming.syntaxNotFrames());
      }else{
        ThreadManager.removeNotFramesAll(this.isCharacter)
      }
      if(parseInt(numHitFrames[0])>0){
        ThreadManager.addHitFrames(VariableTiming.syntaxHitFrames());
      }else{
        ThreadManager.removeHitFramesAll(this.isCharacter)
      }
    },
    o:function(){
      var A="";
      var emptyFrameX=0;
      if(VariableTiming.isNotFrames(this.loop,this.isCharacter)){
        emptyFrameX=this.frame-this.eachFrameWidth; // empty frame in 3 dimension.
        A="-"+emptyFrameX+"px 0px";
        VariableTiming.isNotFramesExplode(this.loop,this.isCharacter)
      }else{
        A="-"+this.frame+"px 0px"
      }
      return A
    },
    animation:function(){ // Subset of Array => ENGINE.isCharacter as a reference to object A denoted by px superset animation_ function of A
      var A=ENGINETIME.document.getElementById(this.isCharacter).style;
      var isCondition="";
      var isLoop="";
      var isFrame=0;
      if(this.isSide){
        isCondition="this.loop < this.maxLoop;";
        isLoop="this.loop = this.loop + 1;";
        isFrame="this.frame = this.frame + this.eachFrameWidth;";
      }else{
        // isCondition="(this.loop <= this.maxLoop) && (this.loop != -1)";
        isCondition="this.loop > this.maxLoop;";
        isLoop="this.loop = this.loop - 1;";
        isFrame="this.frame = this.frame - this.eachFrameWidth;";
      }
      if(eval(isCondition)){
        eval(isLoop+isFrame);
        if(VariableTiming.isHitFrames(this.loop,this.isCharacter)){ // hit frame
          this.broadcast() // broadcast do
          VariableTiming.isHitFramesExplode(this.loop,this.isCharacter)
        }
        A.backgroundPosition=this.xYpixels();
      }else{ // the last frame is executed which is the last thread before termination and is the frame "buffer" 0th iteration of the next animation.
        if(!ThreadManager.find("gravityTimer1")){
          this.idle()
        }
      }
      ThreadManager.allocState();
      this.fps=Math.round(this.fps/ENGINETIME.distribution);
      ThreadManager.end("animationTimer1");
      ThreadManager.start("animationTimer1","Player.animation();",this.fps);
      ThreadManager.allocSet()
    },
    idle:function(){
      VariableTiming.do="_IDLE";
      VariableTiming.isSide=this.isSide;
      this.state=VariableTiming.do;
      this.syncFramesTypeSettings();
      this.unLockAll(this.isCharacter);
      ENGINETIME.lock=false;
      this.getStateType();
      // this.attack=false;
			// this.block=false;
			// this.air=false;
			ThreadManager.addLock("idle()");
			ThreadManager.counterLock();
      this.initFrames();
			this.initSpeed(100);
			ThreadManager.end("animationTimer1");
			ThreadManager.start("animationTimer1","Player.animation();",ENGINETIME.force)
		},
		kick1:function(){
      VariableTiming.do="_KICK1";
      VariableTiming.isSide=this.isSide;
      this.state=VariableTiming.do;
      this.syncFramesTypeSettings();
			ENGINETIME.lock=false;
      this.getStateType();
      // this.attack=true;
			ThreadManager.addLock("kick1()");
			ThreadManager.counterLock();
			this.initFrames();
			this.initSpeed(50);
      ThreadManager.end("animationTimer1");
			ThreadManager.start("animationTimer1","Player.animation();",ENGINETIME.force)
		},
		kick3:function(){
      VariableTiming.do="_KICK3";
      VariableTiming.isSide=this.isSide;
      this.state=VariableTiming.do;
      this.syncFramesTypeSettings();
			ENGINETIME.lock=false;
      this.getStateType();
      // this.attack=true;
			ThreadManager.addLock("kick3()");
			ThreadManager.counterLock();
			this.initFrames();
			this.initSpeed(50);
			ThreadManager.end("animationTimer1");
			ThreadManager.start("animationTimer1","Player.animation();",ENGINETIME.force)
		},
    antiAir:function(){
      VariableTiming.do="_ANTIAIR";
      VariableTiming.isSide=this.isSide;
      this.state=VariableTiming.do;
      this.syncFramesTypeSettings();
			ENGINETIME.lock=false;
      this.getStateType();
      // this.attack=true;
			ThreadManager.addLock("antiAir()");
			ThreadManager.counterLock();
      this.initFrames();
      this.initSpeed(50);
			ThreadManager.end("animationTimer1");
			ThreadManager.start("animationTimer1","Player.animation();",ENGINETIME.force)
		},
		kick1air:function(){
      VariableTiming.do="_KICK1AIR";
      VariableTiming.isSide=this.isSide;
      this.state=VariableTiming.do;
      this.syncFramesTypeSettings();
			ENGINETIME.lock=false;
      this.getStateType();
      // this.attack=true;
			ThreadManager.addLock("kick1air()");
			ThreadManager.counterLock();
			this.initFrames();
			this.initSpeed(50);
			ThreadManager.end("animationTimer1");
			ThreadManager.start("animationTimer1","Player.animation();",ENGINETIME.force)
		},
		kick3air:function(){
      VariableTiming.do="_KICK3AIR";
      VariableTiming.isSide=this.isSide;
      this.state=VariableTiming.do;
      this.syncFramesTypeSettings();
			ENGINETIME.lock=false;
      this.getStateType();
      // this.attack=true;
			ThreadManager.addLock("kick3air()");
			ThreadManager.counterLock();
			this.initFrames();
			this.initSpeed(50);
			ThreadManager.end("animationTimer1");
			ThreadManager.start("animationTimer1","Player.animation();",ENGINETIME.force)
		},
		punch1:function(){
      VariableTiming.do="_PUNCH1";
      VariableTiming.isSide=this.isSide;
      this.state=VariableTiming.do;
      this.syncFramesTypeSettings();
			ENGINETIME.lock=false;
      this.getStateType();
      // this.attack=true;
			ThreadManager.addLock("punch1()");
			ThreadManager.counterLock();
			this.initFrames();
			this.initSpeed(50);
			ThreadManager.end("animationTimer1");
			ThreadManager.start("animationTimer1","Player.animation();",ENGINETIME.force)
		},
		punch3:function(){
      VariableTiming.do="_PUNCH3";
      VariableTiming.isSide=this.isSide;
      this.state=VariableTiming.do;
      this.syncFramesTypeSettings();
			ENGINETIME.lock=false;
      this.getStateType();
      // this.attack=true;
			ThreadManager.addLock("punch3()");
			ThreadManager.counterLock();
			this.initFrames();
			this.initSpeed(50);
			ThreadManager.end("animationTimer1");
			ThreadManager.start("animationTimer1","Player.animation();",ENGINETIME.force)
		},
		punch1air:function(){
      VariableTiming.do="_PUNCH1AIR";
      VariableTiming.isSide=this.isSide;
      this.state=VariableTiming.do;
      this.syncFramesTypeSettings();
			ENGINETIME.lock=false;
      this.getStateType();
      // this.attack=true;
			ThreadManager.addLock("punch1air()");
			ThreadManager.counterLock();
			this.initFrames();
			this.initSpeed(50);
			ThreadManager.end("animationTimer1");
			ThreadManager.start("animationTimer1","Player.animation();",ENGINETIME.force)
		},
		punch3air:function(){
      VariableTiming.do="_PUNCH3AIR";
      VariableTiming.isSide=this.isSide;
      this.state=VariableTiming.do;
      this.syncFramesTypeSettings();
			ENGINETIME.lock=false;
      this.getStateType();
      // this.attack=true;
			ThreadManager.addLock("punch3air()");
			ThreadManager.counterLock();
			this.initFrames();
			this.initSpeed(50);
			ThreadManager.end("animationTimer1");
			ThreadManager.start("animationTimer1","Player.animation();",ENGINETIME.force)
		},
    damage1:function(){
      VariableTiming.do="_DAMAGE1";
      VariableTiming.isSide=this.isSide;
      this.state=VariableTiming.do;
      this.syncFramesTypeSettings();
			ENGINETIME.lock=false;
      this.getStateType();
      // this.attack=false;
			this.initFrames();
			this.initSpeed(50);
			ThreadManager.end("animationTimer1");
			this.superclassBubbleON();
			ThreadManager.start("animationTimer1","Player.animation();Player.superclassBubbleOFF();",ENGINETIME.force); // locks & interacts with ai.
		},
		damage1Air:function(){
      VariableTiming.do="_DAMAGE1AIR";
      VariableTiming.isSide=this.isSide;
      this.state=VariableTiming.do;
      this.syncFramesTypeSettings();
			ENGINETIME.lock=false;
      this.getStateType();
      // this.attack=false;
			this.initFrames();
			this.initSpeed(50);
			ThreadManager.end("animationTimer1");
			this.superclassBubbleON();
			ThreadManager.start("animationTimer1","Player.animation();Player.superclassBubbleOFF();",ENGINETIME.force); // locks & interacts with ai.
		},
		block1:function(){
      VariableTiming.do="_BLOCK1";
      VariableTiming.isSide=this.isSide;
      this.state=VariableTiming.do;
      this.syncFramesTypeSettings();
			ENGINETIME.lock=false;
      this.getStateType();
      // this.attack=false;
			// this.block=true;
			ThreadManager.addLock("block1()");
			ThreadManager.counterLock();
			this.initFrames();
			this.initSpeed(50); // if the player exerts force of 50 millisec, the computer's 50 reduces 25. two things, movex static plus force.
			ThreadManager.end("animationTimer1");
			ThreadManager.start("animationTimer1","Player.animation();",ENGINETIME.force);
		},
		pushed:function(){
      VariableTiming.do="_BLOCK1";
      VariableTiming.isSide=this.isSide;
      this.state=VariableTiming.do;
      this.syncFramesTypeSettings();
      ENGINETIME.lock=false;
      this.getStateType();
      // this.attack=false;
			this.xMoveByPixel=Player.displacement; //Computer.displacement
			this.xMoveByPixel=this.xCoordinate-this.xMoveByPixel;
			this.xOrientation="<";
      VariableTiming.xOrigin();
      this.broadcast()
		},
    bubbleON:function(top,left){
      var A=ENGINETIME.document.getElementById(this.isCharacter).style;
      b=document.getElementById("pain").style;
      c=document.getElementById("boom").style;
  		b.visibility="visible";
  		c.visibility="visible"
  	},
  	bubbleOFF:function(){
      var A=ENGINETIME.document.getElementById(this.isCharacter).style;
      b=document.getElementById("pain").style;
      c=document.getElementById("boom").style;
  		b.visibility="hidden";
  		c.visibility="hidden"
  	},
		unlockTIMER:function(){
			this.spamlockALL=false; // locks and interacts with ai. even or odd.
		},
    superclassMoveX:function(){ // walk
			if(this.air){
			}else{
        if(!ThreadManager.find("gravityTimer")){
          VariableTiming.moveX()
        }
			}
		},
    superclassMoveNotX:function(){ // backpedal
			if(this.air){
			}else{
        if(!ThreadManager.find("gravityTimer")){
          VariableTiming.moveNotX()
        }
			}
		},
    superclassMoveY:function(){ // jump
			if(this.air){
			}else{
        VariableTiming.moveY();
        VariableTiming.moveYoffSet(Player);
			}
		},
    superclassMoveYandX:function(){ // flip
			if(this.air){
			}else{
        VariableTiming.moveYandX()
			}
		},
    superclassMoveYnotX:function(){ // backflip
			if(this.air){
			}else{
        VariableTiming.moveYnotX()
			}
		},
		superclassKick1:function(){
			if(this.air){
        this.kick1air()
			}else{
        this.kick1()
			}
		},
    superclassKick2:function(){
			if(this.air){
        this.antiAir()
			}
		},
		superclassKick3:function(){
			if(this.air){
        this.kick3air()
			}else{
        this.kick3()
			}
		},
		superclassPunch1:function(){
			if(this.air){
        this.punch1air()
			}else{
        this.punch1()
			}
		},
		superclassPunch3:function(){
			if(this.air){
        this.punch3air()
			}else{
        this.punch3()
			}
		},
		superclassBlock:function(){
			if(this.air){

      }else{
        this.block1()
			}
		},
    superclassDamage:function(){
			if(this.air){
        this.damage1Air()
      }else{
				this.damage1()
			}
		},
    superclassBubbleON:function(){
			if(this.air){

      }else{
        this.bubbleON()
			}
		},
    superclassBubbleOFF:function(){
			if(this.air){

      }else{
				this.bubbleOFF()
			}
		},
		broadcast:function(){
			ENGINE.instance(this.isCharacter)
		}
};
var Console={
	  displayOutput:function(){
			document.getElementById("letters").style.visibility="visible";
			document.getElementById("console").style.visibility="visible";
			document.getElementById("titleBar").style.visibility="visible";
			document.getElementById("output").style.visibility="visible"
		},
		output:function(A){
			document.getElementById("output").innerHTML=A
		}
};
var Computer={
    object:"",
    state:"",
		pX:0,
		pY:0,
		pTag:"Player2_Tag",
		frame:0,
		loop:1,
		isCharacter:ENGINE.Characters[1],
		toCharacter:ENGINE.Characters[0],
    isStage:ENGINE.Stage[0],
    height:250,
    width:250,
    xCoordinate:180,
		yCoordinate:-10,
    sTag:"Stage_Tag",
    heightZ:473, // stage img
    widthZ:650, // stage img
    positionZ:"absolute",
		lock:false,
    weight:0,
    isSide:false,
		character:function(A){
			this.isCharacter=A
  	},
    empty:function(n){
      // 'AGExEngine システム' //98
    },
  	ai:function(){
      var choice="";
      ThreadManager.addLock("ai()");
			ThreadManager.counterLock();
      //eval(Computer.randomize());
  		Computer.superclassPunch3();
  		ThreadManager.end("aiTimer");
  		ThreadManager.start("aiTimer","Computer.ai();",3000)
  	},
    randomize:function(){
      var queue=[];
      var choice=0;
      queue[0]="Computer.superclassPunch3();";
      // queue[1]="Computer.superclassSuperMove();";
      queue[1]="";
      queue[2]="";
      choice=Computer.getRandomInt(3);
      return queue[choice]
    },
    getRandomInt:function(max){
      return Math.floor(Math.random() * Math.floor(max));
    },
  	setComputerTag:function(){
  		var A=ENGINETIME.document.getElementById(this.pTag).style;
      A=SettingsCSS.apply(A,eval(this.object+"._IDLE[0]"),this.isCharacter);
  		A.left=this.xCoordinate+"px";
  		A.top=this.yCoordinate+"px";
  	},
    setStageTag:function(){
      var A=ENGINETIME.document.getElementById(this.sTag).style;
      A=this.zImg(A);
    },
    unLockAll:function(){
			ThreadManager.removeLock();
			ThreadManager.counterLock()
		},
    zImg:function(a=x){
      var z=eval("_Stage."+this.isStage+"[0]");
      a=SettingsCSS.apply(a,z,null,Computer.isStage);
      return a
    },
    sleep:function(n){
      this.fps=n
    },
    initSpeed:function(c){
      this.area=(1.33*c)+0.1;
			this.fps=c+this.area;
			ENGINETIME.force=Math.round(this.fps);
			this.displacement=Math.round(ENGINETIME.force/4)
    },
    getHitFrames:function(A){
      return A+this.loop;
    },
    initFrames:function(){
      var A=ENGINETIME.document.getElementById(this.isCharacter).style;
      A=SettingsCSS.apply(A,eval(this.object+"."+this.state+"[0]"),this.isCharacter);
      if(this.isSide){
        this.maxLoop=parseInt(eval(this.object+"."+this.state+"[0]._MAX"));
  			this.eachFrameWidth=eval(this.object+"."+this.state+"[0]._EACHxPIXELS");
        this.frame=0;
        this.loop=1
      }else{
        this.loop=parseInt(eval(this.object+"."+this.state+"[0]._MAX"));
  			this.eachFrameWidth=eval(this.object+"."+this.state+"[0]._EACHxPIXELS");
        this.frame=parseInt(eval(this.object+"."+this.state+"[0]._EACHxMAX"))-this.eachFrameWidth;
        this.maxLoop=0;
        A.backgroundPosition=this.xYpixels() // before the animation starts, it's in the 0th iteration so load the last frame for 0
      }
    },
    getStateType:function(){
      var attack=eval(this.object+"."+this.state+"[0]._ATTACK");
      var block=eval(this.object+"."+this.state+"[0]._BLOCK");
      var air=eval(this.object+"."+this.state+"[0]._AIR");
      if(attack!=null){
        this.attack=attack
      }
      if(block!=null){
        this.block=block
      }
      if(air!=null){
        this.air=air
      }
    },
    syncFramesTypeSettings:function(){ // sync frames or missfiring happens.
      VariableTiming.object=this.object;
      var notFrames=VariableTiming.syntaxNotFrames().split(":");
      var hitFrames=VariableTiming.syntaxHitFrames().split(":");
      var numNotFrames=notFrames[1].split(",");
      var numHitFrames=hitFrames[1].split(",");
      if(parseInt(numNotFrames[0])>0){
        ThreadManager.addNotFrames(VariableTiming.syntaxNotFrames());
      }else{
        ThreadManager.removeNotFramesAll(this.isCharacter)
      }
      if(parseInt(numHitFrames[0])>0){
        ThreadManager.addHitFrames(VariableTiming.syntaxHitFrames());
      }else{
        ThreadManager.removeHitFramesAll(this.isCharacter)
      }
    },
    statics:function(C){
      ENGINE.initGravity();
      VariableTiming.statics();
      C.background=Computer.zImg(C); // corresponding background image
      return C
    },
    xYpixels:function(){
      var A="";
      var emptyFrameX=0;
      if(VariableTiming.isNotFrames(this.loop,this.isCharacter)){
        emptyFrameX=this.frame-this.eachFrameWidth; // empty frame in 3 dimension.
        A="-"+emptyFrameX+"px 0px";
        VariableTiming.isNotFramesExplode(this.loop,this.isCharacter)
      }else{
        A="-"+this.frame+"px 0px"
      }
      return A
    },
    animation:function(){
      var A=ENGINETIME.document.getElementById(this.isCharacter).style;
      var isCondition="";
      var isLoop="";
      var isFrame=0;
      if(this.isSide){
        isCondition="this.loop < this.maxLoop;";
        isLoop="this.loop = this.loop + 1;";
        isFrame="this.frame = this.frame + this.eachFrameWidth;";
      }else{
        // isCondition="(this.loop <= this.maxLoop) && (this.loop != -1)";
        isCondition="this.loop > this.maxLoop;";
        isLoop="this.loop = this.loop - 1;";
        isFrame="this.frame = this.frame - this.eachFrameWidth;";
      }
      if(eval(isCondition)){
        eval(isLoop+isFrame);
        if(VariableTiming.isHitFrames(this.loop,this.isCharacter)){ // hit frame
          this.broadcast() // broadcast do
          VariableTiming.isHitFramesExplode(this.getHitFrames(),this.isCharacter)
        }
        A.backgroundPosition=this.xYpixels();
      }else{ // the last frame is executed which is the last thread before termination and is the frame "buffer" 0th iteration of the next animation.
        if(!ThreadManager.find("gravityTimer1")){
          this.idle()
        }
      }
      ThreadManager.allocState();
      this.fps=Math.round(this.fps/ENGINETIME.distribution);
			ThreadManager.end("animationTimer2");
			ThreadManager.start("animationTimer2","Computer.animation();",this.fps);
      ThreadManager.allocSet()
  	},
  	idle:function(){
      VariableTiming.do="_IDLE";
      VariableTiming.isSide=this.isSide;
      this.state=VariableTiming.do;
      this.syncFramesTypeSettings();
      this.getStateType();
      this.unLockAll(this.isCharacter);
      ENGINETIME.lock=false;
  		//this.attack=false;
			ThreadManager.addLock("B.idle()");
			ThreadManager.counterLock();
			this.initFrames();
  		this.initSpeed(100);
  		ThreadManager.end("animationTimer2");
  		ThreadManager.start("animationTimer2","Computer.animation();",this.fps)
  	},
  	punch3:function(){
      VariableTiming.do="_PUNCH3";
      VariableTiming.isSide=this.isSide;
      this.state=VariableTiming.do;
      this.syncFramesTypeSettings();
      this.getStateType();
      ENGINETIME.lock=false;
  		//this.attack=true;
      ThreadManager.addLock("B.punch3()");
			ThreadManager.counterLock();
			this.initFrames();
  		this.initSpeed(100);
  		ThreadManager.end("animationTimer2");
  		ThreadManager.start("animationTimer2","Computer.animation();",ENGINETIME.force)
  	},
    grab:function(){
      VariableTiming.do="_GRAB";
      VariableTiming.isSide=this.isSide;
      this.state=VariableTiming.do;
      this.syncFramesTypeSettings();
      this.getStateType();
      ENGINETIME.lock=false;
  		//this.attack=true;
      ThreadManager.addLock("B.punch3()");
			ThreadManager.counterLock();
			this.initFrames();
  		this.initSpeed(100);
  		ThreadManager.end("animationTimer2");
  		ThreadManager.start("animationTimer2","Computer.animation();",ENGINETIME.force)
  	},
    damage1:function(){
      VariableTiming.do="_DAMAGE1";
      VariableTiming.isSide=this.isSide;
      this.state=VariableTiming.do;
      this.syncFramesTypeSettings();
      this.getStateType();
      ENGINETIME.lock=false;
  		//this.attack=false;
			ThreadManager.addLock("B.damage1()");
			ThreadManager.counterLock();
			this.initFrames();
  		this.initSpeed(50);
      this.bubbleON();
  		ThreadManager.end("animationTimer2");
  		ThreadManager.start("animationTimer2","Computer.animation();Computer.bubbleOFF();",ENGINETIME.force)
  	},
  	locked:function(){ // locks the character from repeated input. it's an interaction with ai.
      VariableTiming.do="_LOCKED";
      VariableTiming.isSide=this.isSide;
      this.state=VariableTiming.do;
      this.syncFramesTypeSettings();
      this.getStateType();
  		ENGINETIME.lock=false;
      //this.attack=false;
			ThreadManager.addLock("locked()");
			ThreadManager.counterLock();
			this.initFrames();
      this.sleep(15000); // paused
  		ThreadManager.end("animationTimer2");
  		ThreadManager.start("animationTimer2","Computer.animation();",ENGINETIME.force)
  	},
    superMove:function(){
      VariableTiming.do="_SUPERMOVE";
      VariableTiming.isSide=this.isSide;
      this.state=VariableTiming.do;
      this.syncFramesTypeSettings();
      this.getStateType();
      ENGINETIME.lock=false;
  		//this.attack=true;
      ThreadManager.addLock("B.supermove()");
			ThreadManager.counterLock();
			this.initFrames();
  		this.initSpeed(100);
  		ThreadManager.end("animationTimer2");
  		ThreadManager.start("animationTimer2","Computer.animation();",ENGINETIME.force)
    },
    bubbleON:function(){
      A=document.getElementById("bleep").style;
      B=document.getElementById("tinkle").style;
  		A.visibility="visible";
  		B.visibility="visible"
  	},
  	bubbleOFF:function(){
      A=document.getElementById("bleep").style;
      B=document.getElementById("tinkle").style;
  		A.visibility="hidden";
  		B.visibility="hidden"
  	},
    superclassSuperMove:function(){ // walk
			if(this.air){
			}else{
        this.superMove();
        VariableTiming.statics()
			}
		},
    superclassMoveX:function(){ // walk
			if(this.air){
			}else{
        if(!ThreadManager.find("gravityTimer2")){
          VariableTiming.moveX()
        }
			}
		},
    superclassMoveNotX:function(){ // backpedal
			if(this.air){
			}else{
        if(!ThreadManager.find("gravityTimer2")){
          VariableTiming.moveNotX()
        }
			}
		},
    superclassMoveY:function(){ // jump
			if(this.air){
			}else{
        VariableTiming.moveY();
        VariableTiming.moveYoffSet(Computer)
			}
		},
    superclassMoveYandX:function(){ // flip
			if(this.air){
			}else{
        VariableTiming.moveYandX()
			}
		},
    superclassMoveYnotX:function(){ // backflip
			if(this.air){
			}else{
        VariableTiming.moveYnotX()
			}
		},
		superclassKick1:function(){
			if(this.air){
        this.kick1air()
			}else{
	      this.kick1()
			}
		},
    superclassKick2:function(){
			if(this.air){
        this.antiAir()
			}
		},
		superclassKick3:function(){
			if(this.air){
        this.kick3air()
			}else{
        this.kick3()
			}
		},
		superclassPunch1:function(){
			if(this.air){
        this.punch1air()
			}else{
        this.punch1()
			}
		},
		superclassPunch3:function(){
			if(this.air){
        this.punch3air()
			}else{
        this.punch3()
			}
		},
    superclassLocked:function(){
			if(this.air){
      }else{
        this.locked()
			}
		},
		superclassBlock:function(){
			if(this.air){
      }else{
        this.block1()
			}
		},
    superclassDamage:function(){
			if(this.air){
        this.damage1Air()
      }else{
				this.damage1()
			}
		},
    superclassBubbleON:function(){
			if(this.air){
      }else{
        this.bubbleON()
			}
		},
    superclassBubbleOFF:function(){
			if(this.air){
      }else{
				this.bubbleOFF()
			}
		},
  	broadcast:function(){
  		ENGINE.instance(this.isCharacter)
  	}
};
var ThreadøallocState={
    CPU:0,
    pX:0,
    pY:0,
    pTag:"Player0_Tag",
    frame:0,
    loop:0,
    xCoordinate:"-{~3x10e8}",
    yCoordinate:"-{~3x10e8}",
    sTag:"m",
    heightZ:"~3x10e8",
    widthZ:"~3x10e8",
    positionZ:"absolute",
    lock:true,
    language:["ベイマックス","Beimakkusu"],
    pseudo:[""],
    empty:function(m){
      // 'AGExEngine カナリア' //this
    },
    bayMax:function(){
      // 'AGExEngine システム' //98
    },
    join:function(){

    },
    push:function(){
      //OSTIME.millisec++;
      ThreadManager.removeLock("m=allocState({})");
      ThreadManager.addLock("m=allocState({})"); //  m=idle({}) "wirelessly"
      ThreadManager.counterLock()
    },
    allocState:function(){
      var OHWOWOHWOWOHWOW="Håppy"
    },
    message:function(){
      alert(OHWOWOHWOWOHWOW)
    },
    ability:function(jp){
      switch (jp==0) {
        case expression:
          this.pseudo[0]=language[0]
          break;
        default:
          this.pseudo[0]=language[1]
      }
    },
    timeDilation:function(){
      return (--OSTIME.millisec>0)?false:false
    },
    vulnerability:function(){
      OSTIME.vulnerability="hidden"
    },
    api_variableTiming:function(){
      // morse code from cpu by clock speed.
      // deliberate delay request requred else ~3x10e8
    },
    api_ALSA_Sound:function(){m=`
            ;M";::;;
           ,':;: ""'.
          ,M;. ;MM;;M:
          ;MMM::MMMMM:
         ,MMMMM'MMMMM:
         ;MMMMM MMMMMM
         MMMMM::MMMMMM:
         :MM:',;MMMMMM'
         ':: 'MMMMMMM:
           '; :MMMMM"
              ''"""'
               .
               M
               M
      .        M           .
      'M..     M        ,;M'
      :MMM.    M      ;MM:
      'MMM;    M     :MMM:
      MMMM.    M     MMMM:
      :MMMM:   M     MMMM:
      :MMMM:   M     :MMMM:
      :MMMMM   M     ;MMMM:
      'MMMMM;  M     ,MMMMM:
      :MMMMM.  M     ;MMMMM'
       :MMMM;  M     :MMMMM"
        'MMMM  M     ;MMMM"
      -hrr- ':MM  M ,MMM:'
           "": M :""'
    `
    },
    bubbleON:function(){
      document.getElementById("pain").style.visibility="visible";
      document.getElementById("boom").style.visibility="visible"
    },
    bubbleOFF:function(){
      document.getElementById("pain").style.visibility="hidden";
      document.getElementById("boom").style.visibility="hidden"
    },
    message:function(A){
      if(Player.msg==true){
        A=A.replace("()","(\"Player.bubbleON();\")")
      }else{
        A=A.replace("()","(\"Player.bubbleOFF();\")")
      }
      eval(A);
    },
    legacy:function(B){
    	var A;
      var B;
    	if(B&&B.which){
    		B=B;
    		A=B.which
    	}else{
    		B=event;
    		A=B.keyCode
    	}
    	Console.output(A);
    	if(A==96){
    		Console.displayOutput();
    		return false
    	}
    	ThreadManager.addInputUser(A);
    }
}
function N(Q,u,ee,n,s,H,R){s=0;Q=u?Q:(1<<Q)-1;H=~(u|ee|n)&Q;while(H)H^=R=-H&H,s+=N(Q,(u|R)<<1,ee|R,(n|R)>>1);return s+=ee==Q} //@HackReactor this ?
// Explaination: https://blog.cloudboost.io/bitwise-n-queens-in-a-tweet-9251ef0e4379
// Hi.
// Explaination.
