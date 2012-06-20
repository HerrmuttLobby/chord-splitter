/* Herrmutt Lobby • Chord Splitter JS 0.4 */
/* (c) Herrmutt Lobby 2012 • herrmuttlobby.com */
/* This code is distributed under a Creative Commons : Attribution, Share Alike, No-commercial Licence */
/* INPUT : list message starting with note then a note number and velocity ( note noteNbr velocity ) or "reset" message to reset the chord */
/* OUTPUT : quick series of ordered note tuples ( [index, noteNbr, velocity, nbrOfNoteInTheChord] ) */
/* MADE TO BE USED WITHIN the JS object of MAX4LIVE or MAX/MSP or in PureData with the jj object of the PDJ external (http://www.le-son666.com/software/pdj/) */

/* CONFIG (should be done with message through an inlet */

groupSend = false; // choose between pushing note once by once through the outlet, or all in a big tuple
DEBUG    = false; // put in debug mode

/* CODE */

/* quick sort function */
quicksort = function( input ){
  if(input.length <= 1) return input;

  var pivot   = input.splice(0, 1);
  var less    = [];
  var greater = [];
  
  for(i = 0; i < input.length; i++)
  {
    x = input[i];
    
    if (x[0] <= pivot[0][0])
      less.push(x);
    else
      greater.push(x);
  }
  
  return [].concat(quicksort(less), pivot, quicksort(greater));
}

var splitter = {
   groupSend : groupSend
  ,chord     : []
  ,addStatus : false
  ,outChord  : []
}

splitter.newNote = function(note){
  if(DEBUG) post("newnote" + note);

  if( note[1] ) // if velocity is greater than 0
    this.addNote(note);
  else
    this.delNote(note);
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

splitter.reset = function(){
  this.chord = [];
}

/* perhaps outputs the whole chord */
splitter.output42 = function(){
  this.outChord = [];
  
  for (i = 0; i < this.chord.length; i++){ // check all notes
        if(this.chord[i][3] != i+1) // if note index changed
        {
            // send note off
            outlet(0, [this.chord[i][3], this.chord[i][0], 0, this.chord.length-1]);
            // update note index
            this.chord[i][3] = i+1;
            // send note on through the new chanel
            outlet(0, [this.chord[i][3], this.chord[i][0], this.chord[i][1], this.chord.length]);
        }
  }
  
  if(splitter.groupSend == true){ /* SENDING THE WHOLE CHORD AS A BIG TUPLE CONTAINING TUPLES */
    outlet(0, outChord);
  }
}

splitter.outLogic = function(i)
{
    var out = [i+1, this.chord[i][0], this.chord[i][1], this.chord.length];
    
    if(DEBUG)
        post('i = ' + ( i + 1 ) + ' :: ' + this.chord[i]);
    
    /* SENDING TUPLE ONE AT A TIME */
    if(splitter.groupSend == false){ 
        
        if(this.chord[i][2] == false){
            this.chord[i][2] = true;
            this.chord[i].push(i+1);
            outlet(0, out);
        }

    }
    
    this.outChord.push(out);
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