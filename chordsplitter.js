/* Herrmutt Lobby • Chord Splitter JS 0.62 */
/* (c) Herrmutt Lobby 2012 • herrmuttlobby.com */
/* This code is distributed under a Creative Commons : Attribution, Share Alike, No-commercial Licence */
/* INPUT : list message starting with note then a note number and velocity ( note noteNbr velocity ) or "reset" message to reset the chord */
/* OUTPUT : quick series of ordered note tuples ( [index, noteNbr, velocity, nbrOfNoteInTheChord] ) */
/* MADE TO BE USED WITHIN the JS object of MAX4LIVE or MAX/MSP or in PureData with the jj object of the PDJ external (http://www.le-son666.com/software/pdj/) */

/* CONFIG (should be done with message through an inlet */

groupSend = false; // choose between pushing note once by once through the outlet, or all in a big tuple
DEBUG     = false; // put in debug mode

/* CODE */

/* quick sort function */
quicksort = function( input ){
  if(input.length <= 1) return input;

  var pivot   = input.splice(0, 1);
  var less    = [];
  var greater = [];
  var x;

  for(i = 0; i < input.length; i++)
  {
    x = input[i];
    x <= pivot[0][0] ? less.push(x) : greater.push(x);
  }
  
  return [].concat(quicksort(less), pivot, quicksort(greater));
}

var splitter = {
   groupSend : groupSend
  ,chord     : []
  ,addStatus : false
  ,outChord  : []
}

//*NOTE IN*//
//* When a note is received we check if the note is a note on or a note off and route them accordingly. *//
splitter.newNote = function(note){
  if(DEBUG) post("newnote " + note); 

  // if note velocity different of 0 add note otherwise remove
  note[1] ? this.addNote(note) : this.delNote(note);
}


//*NOTE ON*//
//* When a note on (vel not equal to 0) is received, the note is added to the buffer, then the buffer is sorted and sent to output *//
splitter.addNote = function(note){ /* add a note to the chord */
  this.addStatus = true;
  this.chord.push(note);
  this.chord = quicksort(this.chord);

  this.output42();
}

//*NOTE OFF*//
//* When a note with a velocity of 0 (note off) is received, the corresponding note on is removed from the buffer and the note off is send with the channel number of the corresponding note on, then the buffer is sent to output *//
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

//*RESET*//
//* On a reset message a note off is sent to the output and the buffer is cleared. *//
splitter.reset = function() 
{
  for (i = 0; i< this.chord.length; i++)
  {
    outlet(0, [this.chord[i][3], this.chord[i][0], 0, this.chord.length-1]);
  }
  this.chord = [];
}

//*OUTPUT*//
//* When we need to send the whole buffer (after a note on or off) we trig this output function *//
splitter.output42 = function(){
  this.outChord = []; //init the big tuple wich will be sent if we asked for
  
  for (i = 0; i < this.chord.length; i++){
    
    if(this.chord[i][3] != i+1 && this.chord[i][3]) // if the note channel has been shifted from previous position
    {
      outlet(0, [this.chord[i][3], this.chord[i][0], 0, this.chord.length-1]); // send note off
      this.chord[i][2] = false;
    }
    
    this.chord[i][3] = i+1; // change the channel number
    
    if(splitter.groupSend == false){ // send note on
      if(this.chord[i][2] == false)
      {
          outlet(0, [this.chord[i][3], this.chord[i][0], this.chord[i][1], this.chord.length]);
          this.chord[i][2] = true;
      }
    }
    else{ //populate the big tuple
      this.outChord.push([this.chord[i][3], this.chord[i][0], this.chord[i][1], this.chord.length]);
    }
  }
  
  if(splitter.groupSend == true){ /* Sending the big tuple if asked for */
    outlet(0, outChord);
    outlet(1, this.chord.length);
  }
}

/* MAIN */

inlets  = 1; // number of inlets
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