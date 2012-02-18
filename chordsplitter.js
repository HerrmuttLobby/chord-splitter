/* Herrmutt Lobby • Chord Splitter JS 0.4 */
/* (c) Herrmutt Lobby 2012 • herrmuttlobby.com */
/* This code is distributed under a Creative Commons : Attribution, Share Alike, No-commercial Licence */
/* INPUT : list message starting with note then a note number and velocity ( note noteNbr velocity ) or "reset" message to reset the chord */
/* OUTPUT : quick series of ordered note tuples ( [index, noteNbr, velocity, nbrOfNoteInTheChord] ) */
/* MADE TO BE USED WITHIN the JS object of MAX4LIVE or MAX/MSP or in PureData with the jj object of the PDJ external (http://www.le-son666.com/software/pdj/) */

/* CONFIG (should be done with message through an inlet */

groupSend = false; // choose between pushing note once by once through the outlet, or all in a big tuple
debug = false; // put in debug mode

/* CODE */

quicksort = function(input){ /* quick sort function */
  if(input.length <= 1)
  {
    return input;
  }else
  {
    var pivot = input.splice(0, 1);
    var less = [];
    var greater = [];
    var output = [];
    
    for (i = 0; i < input.length; i++)
    {
      x = input[i];
      
      if (x[0] <= pivot[0][0])
      {
        less.push(x);
      }else{
        greater.push(x);
      }
    }
    
    return output.concat(quicksort(less), pivot, quicksort(greater));
  }
}

var splitter = new Object;

splitter.groupSend = groupSend;
splitter.debug = debug;
splitter.chord = [];
splitter.addStatus = false;
splitter.outChord = [];

splitter.newNote = function(note) /* receive a new note info */
{
  if(splitter.debug == true)
  {
    post("newnote " + note); 
  }

  if(note[1] === 0)
  {
    this.delNote(note);
  }else
  {
    this.addNote(note);
  }
}

splitter.addNote = function(note){ /* add a note to the chord */
  this.addStatus = true;
  this.chord.push(note);
  this.chord = quicksort(this.chord);

  this.output42();
}

splitter.delNote = function(note){
  this.addStatus = false;
  
  for (i = 0; i < this.chord.length; i++)
  {
    if(this.chord[i][0] === note[0])
    {
      outlet(0, [this.chord[i][3], this.chord[i][0], 0, this.chord.length-1]);
      this.chord.splice(i, 1);
    }
  }
 
  this.output42();
}

splitter.reset = function()
{
  this.chord = [];
}

splitter.output42 = function(){
  this.outChord = [];
  
  for (i = 0; i < this.chord.length; i++){
        if(this.chord[i][3] != i+1)
        {
            outlet(0, [this.chord[i][3], this.chord[i][0], 0, this.chord.length-1]);
            this.chord[i][3] = i+1;
            outlet(0, [this.chord[i][3], this.chord[i][0], this.chord[i][1], this.chord.length]);
        }
  }
  
  if(this.addStatus === true)
  {
    for (i = 0; i < this.chord.length; i++)
    {
        this.outLogic(i)
    }
  }else
  {
    for (i = this.chord.length-1 ; i >= 0 ; i--)
    {
        this.outLogic(i)
    }
  }
  
  if(splitter.groupSend == true){ /* SENDING THE WHOLE CHORD AS A BIG TUPLE CONTAINING TUPLES */
    outlet(0, outChord);
 //   outlet(1, this.chord.length);
  }
}

splitter.outLogic = function(i)
{
    var out = [i+1, this.chord[i][0], this.chord[i][1], this.chord.length];
    
    if( this.debug === true )
    {
        k = i +1;
        post('i = ' + k + ' :: ' + this.chord[i]);
    }
    
    if(splitter.groupSend == false){ /* SENDING TUPLE ONE AT A TIME */
        
        if(this.chord[i][2] == false){
            this.chord[i][2] = true;
            this.chord[i].push(i+1);
            outlet(0, out);
        }
//      outlet(1, this.chord.length);
    }
    
    this.outChord.push(out);
}

/* MAIN */

inlets = 1; // number of inlets
outlets = 2; // number of outlets

function note(note, vel)
{
  splitter.newNote([note, vel, false]);
}

function list(info, note, vel)
{
  splitter.newNote([note, vel, false]);
}

function reset()
{
  splitter.reset();
}