import React, {useState, useEffect} from 'react';
import ReactDom from 'react-dom';

import './index.css';

import Dice from './dices.js';
//import KeyboardIcon from '@material-ui/icons/Keyboard';

let uniq = require('lodash.uniq');

const UPPERY = ["ONES", "TWOS", "THREES", "FOURS", "FIVES", "SIXES"]
const LOWERY = ["3OF", "4OF", "HOUSE", "SMSTR", "LGSTR", "YAHTZEE", "YZBONUS", "CHANCE"]

const LABELS = new Map([
  ["ONES",    "Ones"],
  ["TWOS",    "Twos"],
  ["THREES",  "Threes"],
  ["FOURS",   "Fours"],
  ["FIVES",   "Fives"],
  ["SIXES",   "Sixes"],
  ["3OF",     "Three of a Kind"],
  ["4OF",     "Four of a Kind"],
  ["HOUSE",   "Full House"],
  ["SMSTR",   "Small Straight"],
  ["LGSTR",   "Large Straight"],
  ["YAHTZEE", "Yahtzee"],
  ["YZBONUS", "Yahtzee Bonus"],
  ["CHANCE",  "Chance"],
])

const SUMROLL = function (roll){
  let total = 0;
  roll.forEach( r =>{
    total += r;
  })
  return total;
}

const CHECK_SMSTR = function(roll){ 
  let unq = uniq(roll).sort();

  // Small straight requires 4 of the 5 dice to be in sequence. 
  if (unq.length < 4){
    return false;
  } else if ( unq.length===4){
    return ( unq[1]===unq[0]+1 && unq[2]===unq[1]+1 && unq[3]===unq[2]+1 )
  } else if ( unq.length===5){
    // If all 5 dice are unique, need to check if dice pos0-pos3 are in sequence or if dice pos1-pos4 are in sequence
    return ( unq[1]===unq[0]+1 && unq[2]===unq[1]+1 && unq[3]===unq[2]+1 
          || unq[2]===unq[1]+1 && unq[3]===unq[2]+1 && unq[4]===unq[3]+1 )
  }

}

const CHECK_LGSTR = function(roll){
  return ( roll[1]===roll[0]+1 && roll[2]===roll[1]+1 && roll[3]===roll[2]+1 && roll[4]===roll[3]+1 )
}

const CHECK_3OF = function(roll){
  return( roll[0]===roll[1] && roll[1]===roll[2]
          || roll[1]===roll[2] && roll[2]===roll[3] 
          || roll[2]===roll[3] && roll[3]===roll[4] )
}

const CHECK_4OF = function(roll){
  return( roll[0]===roll[1] && roll[1]===roll[2] && roll[2]===roll[3] 
          || roll[1]===roll[2] && roll[2]===roll[3] && roll[3]===roll[4] )
}

const CHECK_HOUSE = function(roll){
  return ( roll[0]==roll[1] && roll[4]==roll[3] && (roll[2]===roll[4] || roll[2]===roll[0]) && (roll[0] !== roll[4]) ) 
}

const CHECK_YAHTZEE = function(roll){
	return roll.every( (d, index, roll) => d===roll[0] && d>0 )
}


const SCORELOGIC = new Map([
  ["ONES",    roll=>SUMROLL( roll.filter( d=>{ if(d===1) return true; }))],
  ["TWOS",    roll=>SUMROLL( roll.filter( d=>{ if(d===2) return true; }))],
  ["THREES",  roll=>SUMROLL( roll.filter( d=>{ if(d===3) return true; }))],
  ["FOURS",   roll=>SUMROLL( roll.filter( d=>{ if(d===4) return true; }))],
  ["FIVES",   roll=>SUMROLL( roll.filter( d=>{ if(d===5) return true; }))],
  ["SIXES",   roll=>SUMROLL( roll.filter( d=>{ if(d===6) return true; }))],

  ["3OF",     roll=>CHECK_3OF([...roll].sort())? SUMROLL(roll): 0],
  ["4OF",     roll=>CHECK_4OF([...roll].sort())? SUMROLL(roll): 0],
  ["HOUSE",   roll=>CHECK_HOUSE([...roll].sort())? 25: 0],
  ["SMSTR",   roll=>CHECK_SMSTR([...roll].sort())? 30: 0],
  ["LGSTR",   roll=>CHECK_LGSTR([...roll].sort())? 40: 0],
  ["YAHTZEE", roll=>CHECK_YAHTZEE([...roll])? 50: 0],
	["YZBONUS", roll=>0],
  ["CHANCE",  roll=>SUMROLL(roll)],
  ["OTHER",   roll=>roll.filter( d=>{ return true; })] 
])

const arrayAdder = (accumulator, currentVal) => accumulator+currentVal;

function Yahtzee(){
  const [y, setY] = useState({"OTHER":0})
  const [roll, setRoll] = useState( [0, 0, 0, 0, 0])
  const [selectedDice, setSelected] = useState( [false, false, false, false, false])
  const [rollState, setRollState] = useState(0);  

  const [upperTotal, setUpperTotal] = useState(0);
  const [allTotal, setAllTotal] = useState(0);
  const [reset, setReset] = useState(0);

  const [gameCounter, setGameCounter] = useState(0);
  const [gameClasses, setGameClasses] = useState("game");
  const [gameState, setGameState] = useState(false); // Is the game over?  

  const [prevRoll, setPrevRoll] = useState([]);

  const [yzDivRef, setYzDivRef] = useState( React.createRef());
  const [keyBoardColor, setKeyBoardColor] = useState("grey");

  useEffect( ()=>{
    
  }, [])

  useEffect( ()=>{
    if (rollState>3){
      //setRollState(0);
    };
  })

  useEffect( ()=>{
    
    for (var i=0; i<roll.length; i++){
      if ( roll[i]===prevRoll[i]){
        if (i===roll.length){
          console.warn("Yahtzee: prevRoll vs roll didnt change???",  rollState, roll, prevRoll) 
        }
      } else {
        //console.log("Yahtzee: useEffect, roll, prevRoll", rollState, roll, prevRoll);
        return;
      }
    }
  
  }, [roll])

  useEffect( ()=>{
    if (gameCounter===7 || gameCounter===15){
      setGameClasses("game game-seven");
    }
    if (gameCounter===8 || gameCounter===16){
      setGameClasses("game");
    }
  }, [gameCounter])

  useEffect( ()=>{
    // Check if all categories filled
    let gameCheck = true;

    // Calculate sum for upper score card
    let sum = 0;
    for (var c of UPPERY){
      if (y[c] !== undefined){
        sum = sum + y[c]*1
      } else {
        gameCheck = false;
      }
    }
    setUpperTotal(sum);

    // Check bonus for upper score card
    if (sum >=63){
      sum = sum + 35;
    }

    // Calculate sum for lower score card
    for (var c of LOWERY){
      if( y[c] !== undefined){
        sum = sum + y[c]*1;
      } else {
        if ( c !== "YZBONUS") {
          gameCheck = false;
        }
      }
    }

    setAllTotal(sum);
    setGameState(gameCheck);

  }, [y])

  function handleSelect(e, r){

    let tmp = {};

    // Check extra Yahtzee Bonus
    if (y["YAHTZEE"]>0 && SCORELOGIC.get("YAHTZEE")(r)>0){
      tmp["YZBONUS"] = !y["YZBONUS"]?100:y["YZBONUS"]+100;
    }

    // Select Y cat row
    tmp[e.target.id] = e.target.value;
    setY( {...y, ...tmp})


    setRollState(0);
    setRoll([0, 0, 0, 0, 0]);
    setSelected([false, false, false, false, false]);

    // Set focus back to game div for keyboard
    yzDivRef.current.focus();
  }
  
  function rollDice(){
    return Math.floor( Math.random()*6) + 1;
  }

  function rollAll(){
    setPrevRoll(roll);

    setRoll([
      selectedDice[0]===true? roll[0] : rollDice(),
      selectedDice[1]===true? roll[1] : rollDice(),
      selectedDice[2]===true? roll[2] : rollDice(),
      selectedDice[3]===true? roll[3] : rollDice(),
      selectedDice[4]===true? roll[4] : rollDice()
      /*
      // Debugging +1 per roll
      selectedDice[0]===true? roll[0] : roll[0]+1,
      selectedDice[1]===true? roll[1] : roll[1]+1,
      selectedDice[2]===true? roll[2] : roll[2]+1,
      selectedDice[3]===true? roll[3] : roll[3]+1,
      selectedDice[4]===true? roll[4] : roll[4]+1
      */
    ])
    setRollState( rollState+1)
  }

  function diceClick(index){
		if (rollState > 0 ){
    	setSelected([ ...selectedDice.slice(0, index),  selectedDice[index]?false:true, 
                ...selectedDice.slice( index+1, 5)])
		}
  }

  function newGame(){
    setRollState(0);
    setRoll([0, 0, 0, 0, 0]);
    setY({"OTHER":0});
    setSelected([false, false, false, false, false]);
    setReset( reset===0?1:0 );
    setGameCounter(gameCounter+1);
  }

  function handleKeyDown(e){
    //e.preventDefault();
    if (e.key && (e.key==="r" || e.key==="R")){
      // Skip if rollState is 3 or if gameState is true
      // RollButton: setDisabled( props.rollState===3 || props.gameState ? true : false  )
      if ( rollState < 3 && !gameState){
        rollAll();
      }
    } else if ( e.key && e.key==="1") { diceClick(0) 
    } else if ( e.key && e.key==="2") { diceClick(1) 
    } else if ( e.key && e.key==="3") { diceClick(2) 
    } else if ( e.key && e.key==="4") { diceClick(3) 
    } else if ( e.key && e.key==="5") { diceClick(4) 
    }
  }
  
  return (
    <React.Fragment >
      <div className={gameClasses} tabIndex={0} ref={yzDivRef} 
          onKeyDown={handleKeyDown} 
          onFocus={()=>setKeyBoardColor("green")} 
          onBlur={()=>setKeyBoardColor("grey")} >
				<div className="header">
					<button onClick={newGame}> New Game </button>
          <ScoreBoardIcon reset={reset} />
          <KeyBoardIcon color={keyBoardColor} />

				</div>

        <div className="scorecard" >
					<table>
            <thead>
            <tr>
              <th> Upper Section </th>
              <th> Score </th>
            </tr>
          </thead>
          <tbody>
            { UPPERY.map( c => 
              <TableRow key={c} cat={c} y={y} roll={roll} handleSelect={handleSelect} reset={reset} rollState={rollState}/> ) 
            }
            <tr> <td> Bonus </td> 
                <td> { upperTotal>=63? 35 : 0 } </td>
            </tr>
            <tr> 
                <td> Total </td> 
                <td> { upperTotal } </td>
            </tr>
          </tbody>
          </table>

					<table>
            <thead>
            <tr>
              <th> Lower Section </th>
              <th> Score </th>
            </tr>
          </thead>
          <tbody>
            { LOWERY.map( c => 
              <TableRow key={c} cat={c} y={y} roll={roll} handleSelect={handleSelect} reset={reset} rollState={rollState} /> 
            )}
            
            <tr> 
              <td> Combined Total </td> 
              <td>{allTotal}</td>
            </tr>
            
          </tbody>
         </table>
      </div>
     
      <div className="dice-display">
        <DiceDisplay roll={roll} selectedDice={selectedDice} diceClick={diceClick} />
        <RollButton rollAll={rollAll} rollState={rollState} gameState={gameState} />
				<RollCounter rollState={rollState} />
        <SaveScore gameState={gameState} score={allTotal} reset={reset}/>
      </div>

      </div>
    </React.Fragment>
  )
}

function TableRow(props){
  const [disabled, setDisabled] = useState(false);
  const [value, setValue] = useState("");

	useEffect( ()=>{
    setDisabled(false);
  }, [props.reset])

  useEffect( ()=>{
    setValue( props.cat==="YZBONUS" ? props.y["YZBONUS"] 
      : props.y[props.cat]!==undefined ? props.y[props.cat] : SCORELOGIC.get(props.cat)(props.roll) )
  }, [props.roll])


  return (
    <tr>
      <td> {LABELS.get(props.cat)} </td>
      <td> { 
        <button 
          key={props.cat}
          id={props.cat}
          className="table-row-button"
	        disabled={disabled||props.rollState===0||props.cat==="YZBONUS"}
  	      onClick={(e, r)=>{props.handleSelect(e, props.roll); setDisabled(true)}} 
    	    value={value} >
      		  {value}
        </button>
      } </td>
    </tr>
  )
}


function DiceDisplay(props){
  return (
    <>
      { props.roll.map( (r, index) => 
          <Dice key={"dice-"+index} val={r} selected={props.selectedDice[index]} onClick={()=>props.diceClick(index)} />  
      )}
    </>
  )
}

function RollButton(props){
  const [disabled, setDisabled] = useState(false);

  useEffect( ()=>{
    setDisabled( props.rollState===3 || props.gameState ? true : false  )
  })

  return (
    <>
      <button className="dice button" onClick={props.rollAll} disabled={disabled}> Roll </button>
    </>
  )
}

function RollCounter(props){
  return (
    <>
      <span className="roll-counter">
        <span className={props.rollState<1?"dot":"dot filled"} />
        <span className={props.rollState<2?"dot":"dot filled"} />
        <span className={props.rollState<3?"dot":"dot filled"} />      
      </span>
    </>
  )
}

function ScoreBoardIcon(props){
  const [boardClasses, setBoardClasses] = useState("scoreboard board hidden")
  const [scores, setScores] = useState([{id:100, player_name:"", player_score:0}]);

  function toggleScoreBoard(){
    setBoardClasses( boardClasses.includes("hidden") ? "scoreboard board" : "scoreboard board hidden")
    //fetch( "http://3.23.48.14/yahtzee/score")
    fetch( "http://alongsite.com/yahtzee/score")
    .then( res => res.json())
    .then( res => {
      console.log(res.rows);
      setScores(res.rows);
    });
  }

  return  ( <>
    <span className="scoreboard" title="Top 10 High Scores">
      <img onClick={toggleScoreBoard} className="scoreboard icon" src={require("./leaderboard.png")} alt={"Scoreboard"} /> 
      <ScoreBoard childClasses={boardClasses} hideMe={toggleScoreBoard} scores={scores}/>
    </span>
  </> )
}

function ScoreBoard(props){
  return (
    <>
        <table className={props.childClasses} onClick={props.hideMe}>
          <thead>
            <th> Player</th>
            <th> Score </th>
          </thead>
          <tbody> 
            {props.scores.map( (s) => (
              <tr>
                <td> {s.player_name} </td>
                <td> {s.player_score} </td>
              </tr>
            ))}    
          </tbody>   
        </table>
    </>
  )

}

async function postData(url='', data={}){
  const response = await fetch( url, {
    method: 'POST',
    mode: 'cors',
    cache: 'no-cache',
    credentials: 'same-origin',
    headers: {
      'Content-Type' :'application/json'
    },
    redirect: 'follow',
    referrerPolicy: 'no-referrer',
    //body: data
    body: JSON.stringify(data)
  });
  return response;
}

function SaveScore(props){
  let [playerName, setPlayerName] = useState("PLAYER_NAME");
  let [submitted, setSubmitted] = useState(false);
  let [msg, setMsg] = useState("");
  let [msgClasses, setMsgClasses] = useState("");

  useEffect( ()=> {
    setSubmitted(false);
  }, [props.reset])
 
  async function saveScore(){
    console.log("save score:", props.score, playerName, playerName.length, playerName.length>0&&props.score>0);
    //let url = "http://3.23.48.14/yahtzee/score/"
    let url = "http://alongsite.com/yahtzee/score/"
    let data = {player_name: playerName, player_score: props.score}
   
    if ( playerName.length > 0 && props.score > 0){
      postData(url, data) 
        .then( res => {
          if (res.statusText === "OK"){
            setMsg("Score Saved");
            setMsgClasses("msg success");
            setSubmitted(true);
          } else {
            setMsg("Sorry, there was an issue saving your score");
            setMsgClasses("msg error");
          }
          // Not currently used, but if I ever need the response text
          // return res.text()
       })
    } else {
      let m = "";
      if (props.score <= 0){ 
        m += "Score needs to be greater than 0"
      }
      if (playerName.length == 0){
        m += "Player name not entered"
      }
      setMsg(m);
      setMsgClasses("msg error");
    }
  }

  return (
    <>
      { props.gameState ? 
        <div className="save-score">
          <button className="score button" onClick={saveScore} disabled={submitted}> Submit Score </button>
          <form>
            <span>
              <input type="text" value={playerName} onChange={(e)=>setPlayerName(e.target.value)} required minlength="1" maxlength="30" />
            </span>
          </form> 
          <span className={msgClasses}> {msg} </span> 
        </div>
        :
        <div />
      }
    </>
  )
}

function KeyBoardIcon(props){
  return (
    <React.Fragment>    
    <span title="Keyboard Support! &#013; &#009;* R to roll &#013; &#009;* Number Keys (1-5) to select dice &#013; If the keyboard icon isn't green, try clicking on the scorecard">
      <svg width="1em" height="1em" viewBox="0 0 16 16" class="bi bi-keyboard-fill" fill={props.color} xmlns="http://www.w3.org/2000/svg" className="keyboard-icon">
        <path fill-rule="evenodd" d="M0 6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V6zm13 .25a.25.25 0 0 1 .25-.25h.5a.25.25 0 0 1 .25.25v.5a.25.25 0 0 1-.25.25h-.5a.25.25 0 0 1-.25-.25v-.5zM2.25 8a.25.25 0 0 0-.25.25v.5c0 .138.112.25.25.25h.5A.25.25 0 0 0 3 8.75v-.5A.25.25 0 0 0 2.75 8h-.5zM4 8.25A.25.25 0 0 1 4.25 8h.5a.25.25 0 0 1 .25.25v.5a.25.25 0 0 1-.25.25h-.5A.25.25 0 0 1 4 8.75v-.5zM6.25 8a.25.25 0 0 0-.25.25v.5c0 .138.112.25.25.25h.5A.25.25 0 0 0 7 8.75v-.5A.25.25 0 0 0 6.75 8h-.5zM8 8.25A.25.25 0 0 1 8.25 8h.5a.25.25 0 0 1 .25.25v.5a.25.25 0 0 1-.25.25h-.5A.25.25 0 0 1 8 8.75v-.5zM13.25 8a.25.25 0 0 0-.25.25v.5c0 .138.112.25.25.25h.5a.25.25 0 0 0 .25-.25v-.5a.25.25 0 0 0-.25-.25h-.5zm0 2a.25.25 0 0 0-.25.25v.5c0 .138.112.25.25.25h.5a.25.25 0 0 0 .25-.25v-.5a.25.25 0 0 0-.25-.25h-.5zm-3-2a.25.25 0 0 0-.25.25v.5c0 .138.112.25.25.25h1.5a.25.25 0 0 0 .25-.25v-.5a.25.25 0 0 0-.25-.25h-1.5zm.75 2.25a.25.25 0 0 1 .25-.25h.5a.25.25 0 0 1 .25.25v.5a.25.25 0 0 1-.25.25h-.5a.25.25 0 0 1-.25-.25v-.5zM11.25 6a.25.25 0 0 0-.25.25v.5c0 .138.112.25.25.25h.5a.25.25 0 0 0 .25-.25v-.5a.25.25 0 0 0-.25-.25h-.5zM9 6.25A.25.25 0 0 1 9.25 6h.5a.25.25 0 0 1 .25.25v.5a.25.25 0 0 1-.25.25h-.5A.25.25 0 0 1 9 6.75v-.5zM7.25 6a.25.25 0 0 0-.25.25v.5c0 .138.112.25.25.25h.5A.25.25 0 0 0 8 6.75v-.5A.25.25 0 0 0 7.75 6h-.5zM5 6.25A.25.25 0 0 1 5.25 6h.5a.25.25 0 0 1 .25.25v.5a.25.25 0 0 1-.25.25h-.5A.25.25 0 0 1 5 6.75v-.5zM2.25 6a.25.25 0 0 0-.25.25v.5c0 .138.112.25.25.25h1.5A.25.25 0 0 0 4 6.75v-.5A.25.25 0 0 0 3.75 6h-1.5zM2 10.25a.25.25 0 0 1 .25-.25h.5a.25.25 0 0 1 .25.25v.5a.25.25 0 0 1-.25.25h-.5a.25.25 0 0 1-.25-.25v-.5zM4.25 10a.25.25 0 0 0-.25.25v.5c0 .138.112.25.25.25h5.5a.25.25 0 0 0 .25-.25v-.5a.25.25 0 0 0-.25-.25h-5.5z" />
      </svg>
    </span>
    </React.Fragment>
  )
}

ReactDom.render(
  <Yahtzee />,
  document.getElementById('root')
);


